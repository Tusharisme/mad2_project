export default {
  template: `
        <div>
          <input placeholder="email" v-model="email" />
          <input placeholder="password" v-model="password" type="password" />
          <input placeholder="role" v-model="role"  />
          <button @click="register">Register</button>
        </div>
      `,
  data() {
    return {
      email: "",
      password: "",
      role: "",
    };
  },
  methods: {
    async register() {
      try {
        // Create the request body
        const body = JSON.stringify({
          email: this.email,
          password: this.password,
          role: this.role,
        });

        // Perform the fetch request
        const res = await fetch(`${location.origin}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });

        // Handle response
        if (res.ok) {
          console.log("We are Registered");
        } else {
          console.error("Registration failed:", res.statusText);
        }
      } catch (e) {
        console.error("An error occurred:", e);
      }
    },
  },
};
