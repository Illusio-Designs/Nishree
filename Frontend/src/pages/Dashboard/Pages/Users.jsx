import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';
import Filter from '../../../components/common/Filter';
import '../../../Styles/dashboard/Dashboard.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'consumer',
    status: 'active'
  });

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      cell: (row) => (
        <span className={`role-badge ${row.role.toLowerCase()}`}>
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`status-badge ${row.status.toLowerCase()}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ) 
    },
    { header: 'Created At', accessor: 'createdAt' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            onClick={() => handleViewUser(row)}
            variant="view"
          >
            View
          </ActionButton>
          <ActionButton
            onClick={() => handleEditUser(row)}
            variant="edit"
          >
            Edit
          </ActionButton>
          <ActionButton
            onClick={() => handleDeleteUser(row.id)}
            variant="delete"
          >
            Delete
          </ActionButton>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      // This would be replaced with an actual API call
      // const data = await userService.getAllUsers(filterRole);
      // Placeholder data for now
      const data = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          createdAt: '2023-01-15T10:30:00Z',
          lastLogin: '2023-06-20T08:45:00Z'
        },
        {
          id: 2,
          username: 'johndoe',
          email: 'john@example.com',
          role: 'consumer',
          status: 'active',
          createdAt: '2023-02-10T14:20:00Z',
          lastLogin: '2023-06-18T16:30:00Z'
        },
        {
          id: 3,
          username: 'janesmith',
          email: 'jane@example.com',
          role: 'consumer',
          status: 'inactive',
          createdAt: '2023-03-05T09:15:00Z',
          lastLogin: '2023-05-25T11:20:00Z'
        },
        {
          id: 4,
          username: 'mikejohnson',
          email: 'mike@example.com',
          role: 'manager',
          status: 'active',
          createdAt: '2023-04-20T11:45:00Z',
          lastLogin: '2023-06-19T14:10:00Z'
        },
      ];
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '' // Empty password field for security
    });
    setIsEditModalOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'consumer',
      status: 'active'
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // This would be replaced with an actual API call
        // await userService.deleteUser(id);
        // For now, just update the local state
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      // This would be replaced with an actual API call
      // await userService.updateUser(selectedUser.id, formData);
      // For now, just update the local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? 
        {...user, ...formData, password: user.password} : user
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      // This would be replaced with an actual API call
      // const newUser = await userService.createUser(formData);
      // For now, just update the local state with a mock ID
      const newUser = {
        ...formData,
        id: Math.max(...users.map(u => u.id)) + 1,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      setUsers([...users, newUser]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="users-container">
      <div className="header-section">
        <h2 className="dashboard-title">User Management</h2>
        <div className="header-actions">
          <Filter
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'admin', label: 'Admins' },
              { value: 'consumer', label: 'Consumers' },
              { value: 'manager', label: 'Managers' }
            ]}
            value={filterRole}
            onChange={setFilterRole}
          />
          <Button onClick={handleCreateUser} variant="primary">
            Add New User
          </Button>
        </div>
      </div>

      <TableWithControls
        data={users}
        columns={columns}
        searchPlaceholder="Search users..."
        searchFields={['username', 'email']}
      />

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="modal-content">
            <div className="user-details">
              <div className="info-section">
                <h3>Basic Information</h3>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.status}</p>
              </div>
              
              <div className="info-section">
                <h3>Account Information</h3>
                <p><strong>Created At:</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Last Login:</strong> {formatDate(selectedUser.lastLogin)}</p>
              </div>
            </div>

            <div className="modal-footer">
              <ActionButton
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditUser(selectedUser);
                }}
                variant="edit"
              >
                Edit User
              </ActionButton>
              <ActionButton
                onClick={() => setIsViewModalOpen(false)}
                variant="secondary"
              >
                Close
              </ActionButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <form onSubmit={handleSubmitEdit} className="user-form">
          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Leave blank to keep current password"
          />
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="consumer">Consumer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <Button type="submit" variant="primary">Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
      >
        <form onSubmit={handleSubmitCreate} className="user-form">
          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="consumer">Consumer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <Button type="submit" variant="primary">Create User</Button>
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;