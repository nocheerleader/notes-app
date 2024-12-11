export function Spinner() {
    return (
      <div className="flex justify-center" role="status">
        <div className="animate-spin h-6 w-6 border-4 border-gray-300 border-t-primary rounded-full"/>
        <span className="sr-only">Loading...</span>
      </div>
    );
  } 