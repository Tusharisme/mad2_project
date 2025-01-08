import ServicesCard from "../components/ServicesCard.js";

export default {
  components: {
    ServicesCard,
  },
  template: `
    <div>
      <h1>Services</h1>
      <div>
        <ServicesCard v-for="service in services" :key="service.id" :service="service" />
      </div>
    </div>
  `,
  data() {
    return {
      services: [],
    };
  },
  async mounted() {
    try {
      const token = this.$store.state.auth_token;
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const res = await fetch(`${location.origin}/api/services`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        this.services = data;
      } else {
        console.error("Failed to fetch services:", res.statusText);
      }
    } catch (e) {
      console.error("An error occurred:", e);
    }
  },
};
