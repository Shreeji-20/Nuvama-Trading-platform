import React from "react";
import { Modal, useModal } from "../../components/Modal";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Trash2,
  User,
  Save,
  X,
} from "lucide-react";

/**
 * ModalExamples - Comprehensive examples of using the Modal component
 */
export const ModalExamples: React.FC = () => {
  const basicModal = useModal();
  const smallModal = useModal();
  const largeModal = useModal();
  const fullModal = useModal();
  const noBackdropModal = useModal();
  const customModal = useModal();
  const confirmModal = useModal();
  const formModal = useModal();
  const scrollableModal = useModal();
  const centeredModal = useModal();
  const customHeaderModal = useModal();

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Modal Component Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Flexible modal/dialog component with various configurations
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          1. Basic Modal
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={basicModal.open}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open Basic Modal
          </button>
        </div>

        <Modal
          open={basicModal.isOpen}
          onClose={basicModal.close}
          title="Basic Modal"
          description="This is a simple modal with default settings"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              This is the modal content. You can put anything here - text,
              forms, images, etc.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              The modal will close when you click the X button, press Escape, or
              click outside.
            </p>
          </div>
        </Modal>
      </section>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          2. Size Variants
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={smallModal.open}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Small Modal
          </button>
          <button
            onClick={basicModal.open}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Medium Modal (Default)
          </button>
          <button
            onClick={largeModal.open}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Large Modal
          </button>
          <button
            onClick={fullModal.open}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Full Modal
          </button>
        </div>

        <Modal
          open={smallModal.isOpen}
          onClose={smallModal.close}
          title="Small Modal"
          size="sm"
        >
          <p>This is a small modal (400px)</p>
        </Modal>

        <Modal
          open={largeModal.isOpen}
          onClose={largeModal.close}
          title="Large Modal"
          size="lg"
        >
          <p>This is a large modal (600px)</p>
        </Modal>

        <Modal
          open={fullModal.isOpen}
          onClose={fullModal.close}
          title="Full Modal"
          size="full"
        >
          <p>This is a full-width modal (95vw)</p>
        </Modal>
      </section>

      {/* With Footer */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          3. Modal with Footer
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={confirmModal.open}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Confirmation
          </button>
        </div>

        <Modal
          open={confirmModal.isOpen}
          onClose={confirmModal.close}
          title="Confirm Deletion"
          description="This action cannot be undone"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={confirmModal.close}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Deleted!");
                  confirmModal.close();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          }
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this item? This action cannot be
                undone and all associated data will be permanently removed.
              </p>
            </div>
          </div>
        </Modal>
      </section>

      {/* Form Modal */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          4. Form Modal
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={formModal.open}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Add User
          </button>
        </div>

        <Modal
          open={formModal.isOpen}
          onClose={formModal.close}
          title="Add New User"
          description="Fill in the details to create a new user account"
          footer={
            <div className="flex items-center justify-between">
              <button
                onClick={formModal.close}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("User created!");
                  formModal.close();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Create User
              </button>
            </div>
          }
        >
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option>User</option>
                <option>Admin</option>
                <option>Manager</option>
              </select>
            </div>
          </form>
        </Modal>
      </section>

      {/* Scrollable Content */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          5. Scrollable Modal
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={scrollableModal.open}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Long Content Modal
          </button>
        </div>

        <Modal
          open={scrollableModal.isOpen}
          onClose={scrollableModal.close}
          title="Terms and Conditions"
          scrollable={true}
          footer={
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={scrollableModal.close}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
              >
                Decline
              </button>
              <button
                onClick={scrollableModal.close}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Accept
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            {[...Array(20)].map((_, i) => (
              <p key={i}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            ))}
          </div>
        </Modal>
      </section>

      {/* Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          6. Custom Styling
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={customModal.open}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700"
          >
            Custom Styled Modal
          </button>
        </div>

        <Modal
          open={customModal.isOpen}
          onClose={customModal.close}
          title="Custom Styled Modal"
          className="!bg-gradient-to-br !from-pink-50 !to-purple-50 dark:!from-pink-900/20 dark:!to-purple-900/20 border-2 !border-pink-300"
          headerClassName="!bg-gradient-to-r !from-pink-100 !to-purple-100 dark:!from-pink-900/30 dark:!to-purple-900/30"
          blurBackdrop
        >
          <div className="space-y-4">
            <p className="text-pink-900 dark:text-pink-100">
              This modal has custom gradient styling and a blurred backdrop!
            </p>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-purple-900 dark:text-purple-100">
                You can customize colors, borders, backgrounds, and more.
              </p>
            </div>
          </div>
        </Modal>
      </section>

      {/* Custom Header */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          7. Custom Header
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={customHeaderModal.open}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Custom Header Modal
          </button>
        </div>

        <Modal
          open={customHeaderModal.isOpen}
          onClose={customHeaderModal.close}
          header={
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Success!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your action was completed successfully
                </p>
              </div>
            </div>
          }
          footer={
            <button
              onClick={customHeaderModal.close}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Continue
            </button>
          }
        >
          <p className="text-gray-700 dark:text-gray-300">
            This modal uses a custom header component instead of the default
            title/description.
          </p>
        </Modal>
      </section>

      {/* No Backdrop */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          8. Modal Options
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={noBackdropModal.open}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            No Backdrop Modal
          </button>
        </div>

        <Modal
          open={noBackdropModal.isOpen}
          onClose={noBackdropModal.close}
          title="No Backdrop"
          showBackdrop={false}
          closeOnClickOutside={false}
        >
          <p className="text-gray-700 dark:text-gray-300">
            This modal has no backdrop and won't close when clicking outside.
            You must use the close button or press Escape.
          </p>
        </Modal>
      </section>
    </div>
  );
};

export default ModalExamples;
