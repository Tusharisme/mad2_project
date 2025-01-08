export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      service: null,
    };
  },
  async mounted() {
    try {
      const token = this.$store.state.auth_token;
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const res = await fetch(`${location.origin}/api/services/${this.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        this.service = data;
      } else {
        console.error("Failed to fetch service details:", res.statusText);
      }
    } catch (e) {
      console.error("An error occurred:", e);
    }
  },
  template: `
    <div v-if="service">
      <h2>{{ service.name }}</h2>
      <p>{{ service.description }}</p>
      <p>Price: {{ service.base_price }}</p>
      <p>Time Required: {{ service.base_time_required }}</p>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  `,
};
