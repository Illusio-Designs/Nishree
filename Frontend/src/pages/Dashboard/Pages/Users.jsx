import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { FaPlus } from 'react-icons/fa';
import '../../../Styles/dashboard/Category.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'add' | 'edit' | 'view'
  const [selectedUser, setSelectedUser] = useState(null);
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
      render: (row) => (
        <span className={`role-badge ${(row.role || '').toLowerCase()}`}>
          {row.role ? row.role.charAt(0).toUpperCase() + row.role.slice(1) : 'Unknown'}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`status-badge ${(row.status || '').toLowerCase()}`}>
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Active'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlineEye size={20} />}
            onClick={() => handleOpenModal('view', row)}
            variant="view"
            tooltip="View User"
          />
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal('edit', row)}
            variant="edit"
            tooltip="Edit User"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDeleteUser(row.id)}
            variant="delete"
            tooltip="Delete User"
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { userService } = await import('../../../services');
      const data = await userService.getAllUsers();
      const list = Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : [];
      setUsers(list);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (user && (mode === 'edit' || mode === 'view')) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        password: ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'consumer',
        status: 'active'
      });
    }
    setShowModal(true);
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
      setShowModal(false);
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
      setShowModal(false);
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
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">User Management</h2>
        <Button onClick={() => handleOpenModal('add')} className="add-button">
          <FaPlus /> Add User
        </Button>
      </div>

      <TableWithControls
        data={users}
        columns={columns}
        searchPlaceholder="Search users..."
        searchFields={['username', 'email']}
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'consumer', label: 'Consumer' },
              { value: 'manager', label: 'Manager' }
            ]
          }
        ]}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        title={modalMode === 'add' ? 'Add New User' : modalMode === 'edit' ? 'Edit User' : 'User Details'}
      >
        {modalMode === 'view' ? (
          <div className="user-details">
            <div className="info-section">
              <h3>Basic Information</h3>
              <p><strong>Username:</strong> {selectedUser?.username}</p>
              <p><strong>Email:</strong> {selectedUser?.email}</p>
              <p><strong>Role:</strong> {selectedUser?.role}</p>
              <p><strong>Status:</strong> {selectedUser?.status}</p>
            </div>
            <div className="info-section">
              <h3>Account Information</h3>
              <p><strong>Created At:</strong> {formatDate(selectedUser?.createdAt)}</p>
              <p><strong>Last Login:</strong> {formatDate(selectedUser?.lastLogin)}</p>
            </div>
            <div className="modal-actions">
              <Button 
                type="button" 
                className="modal-cancel-button" 
                variant="secondary" 
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={modalMode === 'add' ? handleSubmitCreate : handleSubmitEdit} className="category-form">
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
            {modalMode === 'add' && (
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            )}
            <InputField
              label="Role"
              type="select"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              options={[
                { value: "admin", label: "Admin" },
                { value: "manager", label: "Manager" },
                { value: "consumer", label: "Consumer" }
              ]}
            />
            <InputField
              label="Status"
              type="select"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
            />
            <div className="modal-actions">
              <Button type="submit" className="modal-submit-button">
                {modalMode === 'add' ? 'Create' : 'Update'}
              </Button>
              <Button 
                type="button" 
                className="modal-cancel-button" 
                variant="secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Users;