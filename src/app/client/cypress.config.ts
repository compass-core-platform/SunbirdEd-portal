import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '549ats',
  // pageLoadTimeout: 100000,
  e2e: {
    'baseUrl': 'https://compass-dev.tarento.com'
  },
  // defaultCommandTimeout: 10000,  
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts'
  }
})