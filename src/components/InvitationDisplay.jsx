import { Helmet } from 'react-helmet-async'

function InvitationDisplay({ fields, isEditable, onFieldUpdate }) {
  const renderField = (field) => {
    const baseInputClasses = 'bg-transparent outline-none resize-none overflow-hidden transition-all'
    
    switch (field.type) {
      case 'title':
        return (
          <div key={field.id} className="text-center">
            {isEditable ? (
              <textarea
                rows="1"
                className={`${baseInputClasses} font-playfair text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100 w-full text-center`}
                value={field.value}
                placeholder={field.placeholder}
                onChange={(e) => onFieldUpdate(field.id, { value: e.target.value })}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            ) : (
              <h1 className="font-playfair text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100">
                {field.value}
              </h1>
            )}
          </div>
        )
        
      case 'subtitle':
        return (
          <div key={field.id} className="text-center mb-8">
            {isEditable ? (
              <textarea
                rows="1"
                className={`${baseInputClasses} font-light text-gray-600 dark:text-gray-400 w-full text-center`}
                value={field.value}
                placeholder={field.placeholder}
                onChange={(e) => onFieldUpdate(field.id, { value: e.target.value })}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            ) : (
              <p className="font-light text-gray-600 dark:text-gray-400">
                {field.value}
              </p>
            )}
          </div>
        )
        
      case 'event':
        return (
          <div key={field.id} className="my-8 text-center">
            {isEditable ? (
              <textarea
                rows="1"
                className={`text-2xl text-center w-full overflow-hidden resize-none outline-none px-3 py-1.5 rounded-lg border transition-all bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700`}
                value={field.value}
                placeholder={field.placeholder}
                onChange={(e) => onFieldUpdate(field.id, { value: e.target.value })}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            ) : (
              field.value && (
                <p className="text-2xl text-gray-900 dark:text-gray-100">
                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                    {field.value}
                  </span>
                </p>
              )
            )}
          </div>
        )
        
      case 'detail':
        if (!field.visible) return null
        return (
          <div key={field.id} className="flex items-baseline gap-2">
            {isEditable ? (
              <>
                <span className="font-semibold uppercase text-xs tracking-wider text-gray-500 w-24 text-left">
                  {field.label}
                </span>
                <textarea
                  rows="1"
                  className="flex-1 min-w-[200px] overflow-hidden resize-none outline-none px-3 py-1.5 rounded-lg border transition-all bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700"
                  value={field.value}
                  placeholder={field.placeholder}
                  onChange={(e) => onFieldUpdate(field.id, { value: e.target.value })}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                />
              </>
            ) : (
              field.value && (
                <div className="flex gap-4 w-full">
                  <span className="font-semibold uppercase text-xs tracking-wider text-gray-500 flex-shrink-0">
                    {field.label}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 break-words flex-1">
                    {field.value}
                  </span>
                </div>
              )
            )}
          </div>
        )
        
      case 'footer':
        if (!field.visible) return null
        return (
          <div key={field.id} className="mt-8">
            {isEditable ? (
              <textarea
                rows="1"
                className={`${baseInputClasses} text-sm italic text-center w-full text-gray-600 dark:text-gray-400`}
                value={field.value}
                placeholder={field.placeholder}
                onChange={(e) => onFieldUpdate(field.id, { value: e.target.value })}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
            ) : (
              field.value && (
                <p className="text-sm italic text-center text-gray-600 dark:text-gray-400">
                  {field.value}
                </p>
              )
            )}
          </div>
        )
        
      default:
        return null
    }
  }

  const eventField = fields.find(f => f.id === 'event')

  return (
    <>
      {eventField?.value && !isEditable && (
        <Helmet>
          <title>Invitation: {eventField.value}</title>
        </Helmet>
      )}
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 p-10 md:p-16 rounded-2xl shadow-xl animate-slide-up">
        <div className="text-center">
          {fields.filter(f => f.type === 'title' || f.type === 'subtitle').map(renderField)}
        </div>
        
        {fields.find(f => f.type === 'event' && f.visible) && renderField(fields.find(f => f.type === 'event'))}
        
        <div className="space-y-3 my-8 text-left max-w-md mx-auto">
          {fields.filter(f => f.type === 'detail' && f.visible).map(renderField)}
        </div>

        {fields.find(f => f.type === 'footer' && f.visible) && renderField(fields.find(f => f.type === 'footer'))}
      </div>
    </>
  )
}

export default InvitationDisplay