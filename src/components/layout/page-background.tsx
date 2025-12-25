export function PageBackground() {
  return (
    <>
      {/* Decorative Elements - Top Left */}
      <div className="absolute left-0 top-0 flex items-start gap-1 sm:gap-2 opacity-20 sm:opacity-30">
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg bg-teal-400 flex items-center justify-center">
            <svg className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg bg-blue-400 flex items-center justify-center">
            <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg bg-orange-400 flex items-center justify-center">
            <svg className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="h-6 w-8 sm:h-8 sm:w-12 rounded-t-full bg-yellow-400"></div>
        </div>
        <div className="flex flex-col gap-1 sm:gap-2 mt-4 sm:mt-8">
          <div className="h-6 w-12 sm:h-8 sm:w-16 rounded-lg bg-orange-400"></div>
          <div className="h-6 w-8 sm:h-8 sm:w-12 rounded-lg bg-orange-400"></div>
        </div>
      </div>

      {/* Decorative Elements - Bottom Right */}
      <div className="absolute bottom-0 right-0 flex items-end gap-1 sm:gap-2 opacity-20 sm:opacity-30">
        <div className="flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-8">
          <div className="h-6 w-8 sm:h-8 sm:w-12 rounded-lg bg-blue-200"></div>
          <div className="h-6 w-12 sm:h-8 sm:w-16 rounded-lg bg-blue-200"></div>
          <div className="h-6 w-8 sm:h-8 sm:w-10 rounded-lg bg-blue-200"></div>
        </div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="flex gap-0.5 sm:gap-1">
            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-blue-400 border-2 sm:border-4 border-white"></div>
            <div className="h-6 w-6 sm:h-10 sm:w-10 rounded-full bg-blue-300 border-2 sm:border-4 border-white"></div>
            <div className="h-5 w-5 sm:h-8 sm:w-8 rounded-full bg-blue-200 border-2 sm:border-4 border-white"></div>
          </div>
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg bg-teal-400 flex items-center justify-center">
            <svg className="h-4 w-4 sm:h-6 sm:w-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
          </div>
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg bg-blue-400 grid grid-cols-2 gap-0.5 sm:gap-1 p-0.5 sm:p-1">
            <div className="rounded bg-white"></div>
            <div className="rounded bg-yellow-300"></div>
            <div className="rounded bg-yellow-300"></div>
            <div className="rounded bg-white"></div>
          </div>
        </div>
      </div>
    </>
  )
}

