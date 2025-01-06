export default {
  template: `
      <div>
        <input placeholder="email" v-model="email" />
        <input placeholder="password" v-model="password" type="password" />
        <button @click="submitLogin">Login</button>
      </div>
    `,
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async submitLogin() {
      try {
        // Create the request body
        const body = JSON.stringify({
          email: this.email,
          password: this.password,
        });

        // Perform the fetch request
        const res = await fetch(`${location.origin}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });

        // Handle response
        if (res.ok) {
          console.log("Login successful");
          const data = await res.json();
          console.log(data);
        } else {
          console.error("Login failed:", res.statusText);
        }
      } catch (e) {
        console.error("An error occurred:", e);
      }
    },
  },
};
