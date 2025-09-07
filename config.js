// Configuration for the API Specs viewer
const CONFIG = {
    // Directory containing the OpenAPI specification files
    specsDirectory: './specs/',

    // Manual list of spec files (required for GitHub Pages since it doesn't serve directory listings)
    // Add your spec files here with their display names
    specFiles: [
        {
            filename: 'swagger-petstore.yaml',
            displayName: 'Swagger Petstore'
        },
        {
            filename: 'github-api.yaml',
            displayName: 'GitHub API'
        }
    ],

    // Supported file extensions for OpenAPI specs
    supportedExtensions: ['.yaml', '.yml', '.json'],

    // Auto-load the first spec when the page loads
    autoLoadFirstSpec: true,

    // UI Configuration
    ui: {
        title: 'API Specifications',
        subtitle: 'Browse and explore your OpenAPI specifications',
        loadingText: 'Loading specifications...',
        noSpecsTitle: 'No specifications found',
        noSpecsMessage: 'Add spec files to the specFiles array in config.js'
    },

    // Swagger UI Configuration
    swaggerUI: {
        deepLinking: true,
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        showRequestHeaders: true
    }
};