export default {
  template: `
    <div class="container mt-4">
    <h2 class="text-center mb-4">Customer Service History</h2>
    
    <!-- Service History Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">Pending Requests</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'accepted' }" @click="activeTab = 'accepted'">Accepted Requests</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">Completed Services</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'">Rejected Services</a>
      </li>
    </ul>

    <!-- Pending Requests Table -->
    <div v-if="activeTab === 'pending'" class="table-responsive">
      <h3>Pending Service Requests</h3>
      <div v-if="pendingRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Service Name</th>
              <th>Requested Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in pendingRequests" :key="request.id">
              <td>{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.requested_date) }}</td>
              <td>{{ request.service_status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">No pending service requests available.</p>
      </div>
    </div>

    <!-- Accepted Requests Table -->
    <div v-if="activeTab === 'accepted'" class="table-responsive">
      <h3>Accepted Service Requests</h3>
      <div v-if="acceptedRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Service Name</th>
              <th>Requested Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in acceptedRequests" :key="request.id">
              <td>{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.requested_date) }}</td>
              <td>{{ request.service_status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">No accepted service requests yet.</p>
      </div>
    </div>

    <!-- Completed Services Table -->
    <div v-if="activeTab === 'completed'" class="table-responsive">
      <h3>Completed Services</h3>
      <div v-if="completedRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Service Name</th>
              <th>Completion Date</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in completedRequests" :key="request.id">
              <td>{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.date_of_completion) }}</td>
              <td>{{ request.rating || 'Not rated yet' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">No completed services yet.</p>
      </div>
    </div>

    <!-- Rejected Services Table -->
    <div v-if="activeTab === 'rejected'" class="table-responsive">
      <h3>Rejected Services</h3>
      <div v-if="rejectedRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Service Name</th>
              <th>Requested Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in rejectedRequests" :key="request.id">
              <td>{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.requested_date) }}</td>
              <td>{{ request.service_status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">No rejected service requests.</p>
      </div>
    </div>
</div>
`,
};
