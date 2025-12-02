<Accordion
  variant="separated"
  allowMultiple={true}
  items={users.map((user) => ({
    id: user.userId,
    title: (
      <div className="flex items-center justify-between w-full">
        <span className="font-semibold">{user.userName}</span>
        <div className="flex gap-3 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Broker: {user.broker || "None"}
          </span>
          {user.authToken && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ● Active
            </span>
          )}
        </div>
      </div>
    ),
    icon: <User className="w-4 h-4" />,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              User ID
            </p>
            <p className="text-sm font-medium">{user.userId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Broker
            </p>
            <p className="text-sm font-medium">{user.broker || "None"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Last Login
            </p>
            <p className="text-sm font-medium">{user.lastLogin || "Never"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Auth Status
            </p>
            <p
              className={`text-sm font-medium ${
                user.authToken
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {user.authToken ? "Authenticated" : "Not Authenticated"}
            </p>
          </div>
        </div>
        {user.authToken && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Auth Token
            </p>
            <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
              {user.authToken}
            </p>
          </div>
        )}
      </div>
    ),
  }))}
/>;
