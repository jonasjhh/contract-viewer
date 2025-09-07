let ui = null;

const CONFIG = {
    ui: {
        title: 'API Specifications'
    },
    swaggerUI: {
        deepLinking: true,
        layout: "StandaloneLayout",
        tryItOutEnabled: true
    }
};

function initializePage() {
    document.title = CONFIG.ui.title;
}

async function initializeSwaggerUIWithSpecs() {
    try {
        // Check if specs config exists
        if (typeof window.SPECS_CONFIG === 'undefined' || window.SPECS_CONFIG.length === 0) {
            document.getElementById('swagger-ui').innerHTML = `
                <div class="no-specs">
                    <h3>No specifications found</h3>
                    <p>No spec files found. Add .yaml, .yml, or .json files to the specs directory and rebuild.</p>
                </div>
            `;
            return;
        }

        // Convert specs to Swagger UI format
        const urls = window.SPECS_CONFIG.map(spec => ({
            url: spec.path,
            name: spec.displayName
        }));

        // Initialize Swagger UI with built-in selector
        ui = SwaggerUIBundle({
            urls: urls,
            "urls.primaryName": urls[0]?.name,
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
                console.log('Swagger UI loaded with', urls.length, 'specs');
            },
            onFailure: (error) => {
                console.error('Swagger UI failed to load:', error);
                document.getElementById('swagger-ui').innerHTML = `
                    <div class="error">
                        <strong>Error loading specifications:</strong><br>
                        ${error.message || 'Unknown error occurred'}
                    </div>
                `;
            }
        });

    } catch (error) {
        console.error('Error initializing Swagger UI:', error);
        document.getElementById('swagger-ui').innerHTML = `
            <div class="error">
                <strong>Error loading specifications:</strong><br>
                ${error.message}
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    initializeSwaggerUIWithSpecs();
});