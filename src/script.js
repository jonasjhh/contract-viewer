let currentSpecs = [];
let ui = null;

const CONFIG = {
    autoLoadFirstSpec: true,
    ui: {
        title: 'API Specifications',
        subtitle: 'Browse and explore your OpenAPI specifications',
        loadingText: 'Loading specifications...',
        noSpecsTitle: 'No specifications found',
        noSpecsMessage: 'No spec files found. Add .yaml, .yml, or .json files to the specs directory and rebuild.'
    },
    swaggerUI: {
        deepLinking: true,
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        showRequestHeaders: true
    }
};

function initializePage() {
    document.title = CONFIG.ui.title;
}

async function loadSpecs() {
    const specList = document.getElementById('spec-list');
    specList.innerHTML = `<div class="loading">${CONFIG.ui.loadingText}</div>`;

    try {
        // Check if auto-generated specs config exists
        if (typeof window.SPECS_CONFIG === 'undefined' || window.SPECS_CONFIG.length === 0) {
            specList.innerHTML = `
                <div class="no-specs">
                    <h3>${CONFIG.ui.noSpecsTitle}</h3>
                    <p>${CONFIG.ui.noSpecsMessage}</p>
                </div>
            `;
            return;
        }

        currentSpecs = window.SPECS_CONFIG;
        renderSpecList(currentSpecs);

        // Auto-load the first spec if configured to do so
        if (CONFIG.autoLoadFirstSpec && currentSpecs.length > 0) {
            loadSpec(currentSpecs[0].path);
        }

    } catch (error) {
        console.error('Error loading specs:', error);
        specList.innerHTML = `
            <div class="error">
                <strong>Error loading specifications:</strong><br>
                ${error.message}
            </div>
        `;
    }
}

function renderSpecList(specs) {
    const specList = document.getElementById('spec-list');

    if (specs.length === 0) {
        specList.innerHTML = `
            <div class="no-specs">
                <h3>${CONFIG.ui.noSpecsTitle}</h3>
                <p>${CONFIG.ui.noSpecsMessage}</p>
            </div>
        `;
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'spec-grid';

    specs.forEach((spec) => {
        const card = document.createElement('div');
        card.className = 'spec-card';
        card.onclick = () => loadSpec(spec.path);

        card.innerHTML = `
            <div class="spec-name">${spec.displayName}</div>
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

    // Find and highlight the active card
    const activeCard = Array.from(document.querySelectorAll('.spec-card')).find(card => {
        const pathText = card.querySelector('.spec-path').textContent;
        return specPath.endsWith(pathText);
    });

    if (activeCard) {
        activeCard.classList.add('active');
    }

    try {
        if (ui) {
            ui = null;
        }

        document.getElementById('swagger-ui').innerHTML = '<div class="loading">Loading specification...</div>';

        ui = SwaggerUIBundle({
            url: specPath,
            dom_id: '#swagger-ui',
            deepLinking: CONFIG.swaggerUI.deepLinking,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: CONFIG.swaggerUI.layout,
            tryItOutEnabled: CONFIG.swaggerUI.tryItOutEnabled,
            onComplete: () => {
                console.log('Swagger UI loaded successfully');
            },
            onFailure: (error) => {
                console.error('Swagger UI failed to load:', error);
                document.getElementById('swagger-ui').innerHTML = `
                    <div class="error">
                        <strong>Error loading specification:</strong><br>
                        ${error.message || 'Unknown error occurred'}<br><br>
                        Make sure the file exists and is a valid OpenAPI specification.
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

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    loadSpecs();
});