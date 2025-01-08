export default {
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  template: `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ service.name }}</h5>
        <p class="card-text">Price: {{ service.base_price }}</p>
        <button @click="showDetails">View Details</button>
      </div>
    </div>
  `,
  methods: {
    showDetails() {
      this.$router.push({
        name: "ServiceDetail",
        params: { id: this.service.id },
      });
    },
  },
};
