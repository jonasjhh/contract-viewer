let currentSpecs = [];
let ui = null;

// Common OpenAPI/Swagger file extensions
const SPEC_EXTENSIONS = ['.yaml', '.yml', '.json'];

async function loadSpecs() {
    const specList = document.getElementById('spec-list');
    specList.innerHTML = '<div class="loading">Loading specifications...</div>';

    try {
        // Try to fetch the specs directory listing
        const response = await fetch('./specs/');

        if (!response.ok) {
            throw new Error(`Failed to load specs directory: ${response.status}`);
        }

        const html = await response.text();
        const specs = parseDirectoryListing(html);

        if (specs.length === 0) {
            specList.innerHTML = `
                <div class="no-specs">
                    <h3>No specifications found</h3>
                    <p>Add OpenAPI spec files (.yaml, .yml, .json) to the ./specs folder</p>
                </div>
            `;
            return;
        }

        currentSpecs = specs;
        renderSpecList(specs);

        // Auto-load the first spec if available
        if (specs.length > 0) {
            loadSpec(specs[0].path);
        }

    } catch (error) {
        console.error('Error loading specs:', error);
        specList.innerHTML = `
            <div class="error">
                <strong>Error loading specifications:</strong><br>
                ${error.message}<br><br>
                Make sure the ./specs folder exists and contains OpenAPI specification files.
            </div>
        `;
    }
}

function parseDirectoryListing(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a[href]');
    const specs = [];

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '../' && !href.startsWith('?')) {
            const isSpecFile = SPEC_EXTENSIONS.some(ext => href.toLowerCase().endsWith(ext));
            if (isSpecFile) {
                const name = href.replace(/\.(yaml|yml|json)$/i, '');
                specs.push({
                    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
                    path: `./specs/${href}`,
                    filename: href
                });
            }
        }
    });

    return specs.sort((a, b) => a.name.localeCompare(b.name));
}

function renderSpecList(specs) {
    const specList = document.getElementById('spec-list');

    if (specs.length === 0) {
        specList.innerHTML = `
            <div class="no-specs">
                <h3>No specifications found</h3>
                <p>Add OpenAPI spec files (.yaml, .yml, .json) to the ./specs folder</p>
            </div>
        `;
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'spec-grid';

    specs.forEach((spec, index) => {
        const card = document.createElement('div');
        card.className = 'spec-card';
        card.onclick = () => loadSpec(spec.path);

        card.innerHTML = `
            <div class="spec-name">${spec.name}</div>
            <div class="spec-path">${spec.filename}</div>
        `;

        grid.appendChild(card);
    });

    specList.innerHTML = '';
    specList.appendChild(grid);
}

async function loadSpec(specPath) {
    // Update active card
    document.querySelectorAll('.spec-card').forEach(card => {
        card.classList.remove('active');
    });

    const activeCard = Array.from(document.querySelectorAll('.spec-card')).find(card =>
        card.querySelector('.spec-path').textContent === specPath.replace('./specs/', '')
    );
    if (activeCard) {
        activeCard.classList.add('active');
    }

    try {
        // Dispose of existing UI
        if (ui) {
            ui = null;
        }

        // Clear the container
        document.getElementById('swagger-ui').innerHTML = '<div class="loading">Loading specification...</div>';

        // Initialize SwaggerUI with the selected spec
        ui = SwaggerUIBundle({
            url: specPath,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            tryItOutEnabled: true,
            requestInterceptor: (req) => {
                // You can add custom headers or modify requests here
                return req;
            },
            onComplete: () => {
                console.log('Swagger UI loaded successfully');
            },
            onFailure: (error) => {
                console.error('Swagger UI failed to load:', error);
                document.getElementById('swagger-ui').innerHTML = `
                    <div class="error">
                        <strong>Error loading specification:</strong><br>
                        ${error.message || 'Unknown error occurred'}
                    </div>
                `;
            }
        });

    } catch (error) {
        console.error('Error initializing Swagger UI:', error);
        document.getElementById('swagger-ui').innerHTML = `
            <div class="error">
                <strong>Error loading specification:</strong><br>
                ${error.message}
            </div>
        `;
    }
}

// Load specs when page loads
document.addEventListener('DOMContentLoaded', loadSpecs);