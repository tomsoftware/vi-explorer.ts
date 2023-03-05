<template>
  <nav>
    <router-link to="/">Resources</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view :rootFolder="rootFolder"/>
</template>

<script src="./app.ts"></script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  background-color: lightgray;
  padding: 1em;
  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
