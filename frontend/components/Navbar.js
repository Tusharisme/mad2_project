export default {
  template: ` 
      <nav>
        <router-link to="/"> Home </router-link>
        <router-link v-if="!$store.state.loggedIn" to="/login"> Login </router-link>
        <router-link v-if="!$store.state.loggedIn" to="/register_customer"> Register </router-link>
        <router-link v-if="$store.state.loggedIn && $store.state.role=='admin'" to="/admin_dashboard"> Admin Dashboard </router-link>
        <router-link v-if="$store.state.loggedIn && $store.state.role=='customer'" to="/services"> Services</router-link>
        <button v-if="$store.state.loggedIn" class="btn btn-primary" @click="$store.commit('logout')">Logout</button>
      </nav>
    `,
};
