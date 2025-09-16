import { useEffect, useState } from 'react'

function Toast({ message, type = 'success', onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div 
      className={`fixed bottom-32 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl text-sm font-medium shadow-xl transition-all duration-300 z-[1001] pointer-events-none backdrop-blur-sm ${
        show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
      }`}
    >
      {message}
    </div>
  )
}

export default Toast