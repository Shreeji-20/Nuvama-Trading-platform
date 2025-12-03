import React from "react";
import { Popover, usePopover } from "../../components/Popover";
import {
  Settings,
  User,
  Bell,
  ChevronDown,
  MoreVertical,
  Info,
  Filter,
  Calendar,
} from "lucide-react";

/**
 * PopoverExamples - Comprehensive examples of using the Popover component
 *
 * This file demonstrates all the features and use cases of the Popover component
 */
export const PopoverExamples: React.FC = () => {
  const { isOpen, open, close, toggle } = usePopover();

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Popover Component Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Flexible popover element with various placement options and
          configurations
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          1. Basic Usage
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Click Me
              </button>
            }
          >
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                This is a simple popover content!
              </p>
            </div>
          </Popover>
        </div>
      </section>

      {/* All Placement Options */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          2. All Placement Options
        </h2>
        <div className="grid grid-cols-3 gap-8 place-items-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Top Row */}
          <Popover
            trigger={
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                Top Start
              </button>
            }
            placement="top-start"
          >
            <div className="p-4">Appears at top-start</div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                Top
              </button>
            }
            placement="top"
          >
            <div className="p-4">Appears at top center</div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                Top End
              </button>
            }
            placement="top-end"
          >
            <div className="p-4">Appears at top-end</div>
          </Popover>

          {/* Left Side */}
          <Popover
            trigger={
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Left
              </button>
            }
            placement="left"
          >
            <div className="p-4">Appears on left</div>
          </Popover>

          {/* Center - Auto Placement */}
          <Popover
            trigger={
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg">
                Auto
              </button>
            }
            placement="auto"
          >
            <div className="p-4">Auto-positioned based on available space</div>
          </Popover>

          {/* Right Side */}
          <Popover
            trigger={
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Right
              </button>
            }
            placement="right"
          >
            <div className="p-4">Appears on right</div>
          </Popover>

          {/* Bottom Row */}
          <Popover
            trigger={
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Bottom Start
              </button>
            }
            placement="bottom-start"
          >
            <div className="p-4">Appears at bottom-start (default)</div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Bottom
              </button>
            }
            placement="bottom"
          >
            <div className="p-4">Appears at bottom center</div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Bottom End
              </button>
            }
            placement="bottom-end"
          >
            <div className="p-4">Appears at bottom-end</div>
          </Popover>
        </div>
      </section>

      {/* With Title and Close Button */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          3. With Title and Close Button
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            }
            title="User Settings"
            showCloseButton
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </div>
            </div>
          </Popover>
        </div>
      </section>

      {/* Custom Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          4. Custom Sizes
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">
                Small (200px)
              </button>
            }
            width="200px"
          >
            <div className="p-4">
              <p className="text-sm">This popover has a fixed width of 200px</p>
            </div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">
                Medium (400px)
              </button>
            }
            width="400px"
          >
            <div className="p-4">
              <p>
                This popover has a fixed width of 400px with more content space
              </p>
            </div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">
                Large (600px)
              </button>
            }
            width="600px"
            maxWidth="90vw"
          >
            <div className="p-4">
              <p>
                This popover has a width of 600px but will respect viewport
                constraints
              </p>
            </div>
          </Popover>
        </div>
      </section>

      {/* Trigger Modes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          5. Trigger Modes
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg">
                Click Mode (default)
              </button>
            }
            triggerMode="click"
          >
            <div className="p-4">Opens on click</div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg">
                Hover Mode
              </button>
            }
            triggerMode="hover"
            hoverDelay={300}
          >
            <div className="p-4">Opens on hover with 300ms delay</div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg">
                Focus Mode
              </button>
            }
            triggerMode="focus"
          >
            <div className="p-4">Opens on focus (keyboard navigation)</div>
          </Popover>
        </div>
      </section>

      {/* With Backdrop */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          6. With Backdrop Overlay
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Open with Backdrop
              </button>
            }
            showBackdrop
            title="Important Notice"
            showCloseButton
          >
            <div className="p-4">
              <p>
                This popover has a backdrop overlay that dims the background
              </p>
            </div>
          </Popover>
        </div>
      </section>

      {/* Without Arrow */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          7. Arrow Options
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg">
                With Arrow (default)
              </button>
            }
            showArrow={true}
          >
            <div className="p-4">Has an arrow pointing to trigger</div>
          </Popover>

          <Popover
            trigger={
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg">
                Without Arrow
              </button>
            }
            showArrow={false}
          >
            <div className="p-4">No arrow</div>
          </Popover>
        </div>
      </section>

      {/* Controlled State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          8. Controlled State (with usePopover hook)
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg">
                Controlled Popover
              </button>
            }
            open={isOpen}
            onOpenChange={(newOpen) => (newOpen ? open() : close())}
          >
            <div className="p-4 space-y-3">
              <p>This popover's state is controlled externally</p>
              <button
                onClick={close}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
              >
                Close from inside
              </button>
            </div>
          </Popover>

          <button
            onClick={toggle}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            {isOpen ? "Close" : "Open"} via External Button
          </button>
        </div>
      </section>

      {/* Real-world Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          9. Real-world Examples
        </h2>

        <div className="flex flex-wrap gap-4">
          {/* User Menu */}
          <Popover
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                <User className="w-4 h-4" />
                John Doe
                <ChevronDown className="w-4 h-4" />
              </button>
            }
            placement="bottom-end"
          >
            <div className="py-2 min-w-[200px]">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-sm">John Doe</p>
                <p className="text-xs text-gray-500">john@example.com</p>
              </div>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                My Profile
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Settings
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Help & Support
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600">
                  Sign Out
                </button>
              </div>
            </div>
          </Popover>

          {/* More Options Menu */}
          <Popover
            trigger={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            }
            placement="bottom-end"
          >
            <div className="py-2 min-w-[180px]">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Edit
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Duplicate
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Archive
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600">
                Delete
              </button>
            </div>
          </Popover>

          {/* Info Tooltip */}
          <Popover
            trigger={
              <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full">
                <Info className="w-5 h-5" />
              </button>
            }
            triggerMode="hover"
            showArrow={true}
            placement="top"
          >
            <div className="p-3 max-w-xs">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This is helpful information that appears when you hover over the
                icon.
              </p>
            </div>
          </Popover>

          {/* Filter Menu */}
          <Popover
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            }
            title="Filter Options"
            showCloseButton
            width="300px"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date Range
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Apply Filters
              </button>
            </div>
          </Popover>

          {/* Date Picker */}
          <Popover
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <Calendar className="w-4 h-4" />
                Select Date
              </button>
            }
            placement="bottom-start"
          >
            <div className="p-4">
              <input
                type="date"
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </Popover>
        </div>
      </section>

      {/* Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          10. Custom Styling
        </h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                Custom Style
              </button>
            }
            className="!bg-gradient-to-br !from-purple-50 !to-pink-50 dark:!from-purple-900 dark:!to-pink-900 !border-purple-300"
          >
            <div className="p-4">
              <p className="text-purple-900 dark:text-purple-100">
                This popover has custom gradient styling!
              </p>
            </div>
          </Popover>
        </div>
      </section>
    </div>
  );
};

export default PopoverExamples;
