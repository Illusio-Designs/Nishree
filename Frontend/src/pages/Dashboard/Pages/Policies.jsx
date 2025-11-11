import React, { useEffect, useState } from "react";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { policyService } from "../../../services";
import "../../../Styles/dashboard/Category.css";

const Policies = () => {
	const [policies, setPolicies] = useState([]);
	const [selectedPolicy, setSelectedPolicy] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState("add");
	const [formData, setFormData] = useState({
		title: "",
		content: ""
	});

	const fetchPolicies = async () => {
		try {
			const data = await policyService.getAllPolicies();
			setPolicies(Array.isArray(data) ? data : (data?.policies || []));
		} catch (error) {
			toast.error("Failed to fetch policies");
			setPolicies([]);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this policy?")) return;
		try {
			await policyService.deletePolicy(id);
			toast.success("Policy deleted");
			fetchPolicies();
		} catch (error) {
			toast.error(error.message || "Failed to delete policy");
		}
	};

	const handleOpenModal = (mode, policy = null) => {
		setModalMode(mode);
		if (policy && mode === "edit") {
			setSelectedPolicy(policy);
			setFormData({
				title: policy.title || "",
				content: policy.content || ""
			});
		} else {
			setSelectedPolicy(null);
			setFormData({
				title: "",
				content: ""
			});
		}
		setShowModal(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (!formData.title || !formData.content) {
				toast.error("Title and Content are required");
				return;
			}
			if (modalMode === "add") {
				await policyService.createPolicy(formData);
				toast.success("Policy created");
			} else {
				await policyService.updatePolicy(selectedPolicy.id, formData);
				toast.success("Policy updated");
			}
			setShowModal(false);
			fetchPolicies();
		} catch (error) {
			toast.error(error.message || `Failed to ${modalMode} policy`);
		}
	};

	useEffect(() => {
		fetchPolicies();
	}, []);

	const columns = [
		{ key: "title", header: "Title" },
		{
			key: "content",
			header: "Content",
			render: (row) => <div className="truncate">{row.content?.slice(0, 120)}{row.content?.length > 120 ? "..." : ""}</div>
		},
		{
			key: "actions",
			header: "Actions",
			render: (row) => (
				<div className="action-buttons">
					<ActionButton
						icon={<HiOutlinePencil size={20} />}
						onClick={() => handleOpenModal("edit", row)}
						variant="edit"
						tooltip="Edit Policy"
					/>
					<ActionButton
						icon={<HiOutlineTrash size={20} />}
						onClick={() => handleDelete(row.id)}
						variant="delete"
						tooltip="Delete Policy"
					/>
				</div>
			)
		}
	];

	return (
		<div className="category-manager">
			<div className="header-section">
				<h2 className="dashboard-title">Policies</h2>
				<Button onClick={() => handleOpenModal("add")} className="add-button">
					<FaPlus /> Add Policy
				</Button>
			</div>

			<TableWithControls columns={columns} data={policies} searchFields={["title", "content"]} />

			<Modal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				title={modalMode === "add" ? "Add New Policy" : "Edit Policy"}
			>
				<form onSubmit={handleSubmit} className="category-form">
					<InputField
						label="Title"
						value={formData.title}
						onChange={(e) => setFormData({ ...formData, title: e.target.value })}
						placeholder="Enter policy title"
						required
					/>
					<InputField
						label="Content"
						value={formData.content}
						onChange={(e) => setFormData({ ...formData, content: e.target.value })}
						placeholder="Enter policy content"
						multiline
						required
					/>
					<div className="modal-actions">
						<Button type="submit" className="modal-submit-button" disabled={!formData.title || !formData.content}>
							{modalMode === "add" ? "Create" : "Update"}
						</Button>
						<Button type="button" onClick={() => setShowModal(false)} className="modal-cancel-button" variant="secondary">
							Cancel
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
};

export default Policies;


