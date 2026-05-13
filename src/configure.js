// Vue 3 with Vue 2 compatibility mode
module.exports = {
  compilerOptions: {
    // Enable Vue 2 compatibility mode
    COMPAT: true,
    // Or use the new config
    migration: {
      // Allow Vue 2 components to work in Vue 3
      MODE: 2
    }
  }
}
