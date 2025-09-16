function InvitationSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-10 md:p-16 max-w-lg rounded-2xl shadow-xl animate-slide-up">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto w-3/4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-8 mx-auto w-1/2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-8 mx-auto w-2/3"></div>
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-4/5"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-3/4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-4/5"></div>
        </div>
      </div>
    </div>
  )
}

export default InvitationSkeleton