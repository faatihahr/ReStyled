export default function TestCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Calendar Page Test</h1>
        <p className="text-lg text-gray-600">If you can see this, the calendar route is working!</p>
        <div className="mt-8">
          <a href="/dashboard" className="text-blue-500 hover:text-blue-700 underline">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
