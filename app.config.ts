export default defineAppConfig({
  ui: {
    colors: {
      primary: 'gold',
    },
    popover: {
      slots: {
        content: 'bg-gradient-to-b from-neutral-900/80 to-purple-900/50 shadow-lg rounded-md ring ring-primary-500 data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-popover-content-transform-origin) focus:outline-none pointer-events-auto',
        arrow: 'fill-default'
      }
    },
    notifications: {
      // Notification system position
      position: 'top-right',
    },
  },
})
