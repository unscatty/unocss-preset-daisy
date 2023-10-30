export default {".alert":{"@apply grid w-full grid-flow-row content-start items-center justify-items-center gap-4 text-center sm:grid-flow-col sm:grid-cols-[auto_minmax(auto,1fr)] sm:justify-items-start sm:text-left":true},".artboard":{"@apply w-full":true},".avatar":{"@apply relative inline-flex":true},".avatar > div":{"@apply block aspect-square overflow-hidden":true},".avatar img":{"@apply h-full w-full object-cover":true},".avatar.placeholder > div":{"@apply flex items-center justify-center":true},".badge":{"@apply inline-flex items-center justify-center transition duration-200 ease-out":true,"@apply h-5 text-sm leading-5":true,"width":"fit-content","paddingRight":"0.563rem","paddingLeft":"0.563rem"},".btm-nav":{"@apply fixed bottom-0 left-0 right-0 flex w-full flex-row items-center justify-around":true,"paddingBottom":"env(safe-area-inset-bottom)"},".btm-nav > *":{"@apply relative flex h-full basis-full cursor-pointer flex-col items-center justify-center gap-1":true},".breadcrumbs":{"@apply max-w-full overflow-x-auto":true},".breadcrumbs > ul,\n  .breadcrumbs > ol":{"@apply flex items-center whitespace-nowrap":true,"minHeight":"min-content"},".breadcrumbs > ul > li, .breadcrumbs > ol > li":{"@apply flex items-center":true},".breadcrumbs > ul > li > a, .breadcrumbs > ol > li > a":{"@apply flex cursor-pointer items-center [@media(hover:hover)]:hover:underline":true},".btn":{"@apply rounded-btn inline-flex flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center border-transparent text-center transition duration-200 ease-out":true,"@apply min-h-12 h-12 px-4":true,"fontSize":"0.875rem","lineHeight":"1em"},".btn-disabled,\n  .btn[disabled],\n  .btn:disabled":{"@apply pointer-events-none":true},".btn-square":{"@apply h-12 w-12 p-0":true},".btn-circle":{"@apply h-12 w-12 rounded-full p-0":true},".btn-group":{"@apply inline-flex":true},".btn-group > input[type=\"radio\"].btn":{"@apply appearance-none":true},".btn-group > input[type=\"radio\"].btn:before":{"content":"attr(data-title)"},".btn:is(input[type=\"checkbox\"]),\n.btn:is(input[type=\"radio\"])":{"@apply w-auto appearance-none":true},".btn:is(input[type=\"checkbox\"]):after,\n.btn:is(input[type=\"radio\"]):after":{"@apply content-[attr(aria-label)]":true},".card":{"@apply relative flex flex-col":true},".card:focus":{"@apply outline-none":true},".card-body":{"@apply flex flex-auto flex-col":true},".card-body :where(p)":{"@apply flex-grow":true},".card-actions":{"@apply flex flex-wrap items-start gap-2":true},".card figure":{"@apply flex items-center justify-center":true},".card.image-full":{"@apply grid":true},".card.image-full:before":{"@apply relative":true,"content":"\"\""},".card.image-full:before,\n    .card.image-full > *":{"@apply col-start-1 row-start-1":true},".card.image-full > figure img":{"@apply h-full object-cover":true},".card.image-full > .card-body":{"@apply relative":true},".carousel":{"@apply inline-flex overflow-x-scroll":true,"scrollSnapType":"x mandatory","scrollBehavior":"smooth"},".carousel-vertical":{"@apply flex-col overflow-y-scroll":true,"scrollSnapType":"y mandatory"},".carousel-item":{"@apply box-content flex flex-none":true,"scrollSnapAlign":"start"},".carousel-center .carousel-item":{"scrollSnapAlign":"center"},".carousel-end .carousel-item":{"scrollSnapAlign":"end"},".chat":{"@apply grid grid-cols-2 gap-x-3 py-1":true},".chat-image":{"@apply row-span-2 self-end":true},".chat-header":{"@apply row-start-1 text-sm":true},".chat-footer":{"@apply row-start-3 text-sm":true},".chat-bubble":{"@apply relative block w-fit px-4 py-2":true,"maxWidth":"90%"},".chat-bubble:before":{"@apply absolute bottom-0 h-3 w-3":true,"backgroundColor":"inherit","content":"\"\"","maskSize":"contain","maskRepeat":"no-repeat","maskPosition":"center"},".chat-start":{"@apply place-items-start":true,"gridTemplateColumns":"auto 1fr"},".chat-start .chat-header":{"@apply col-start-2":true},".chat-start .chat-footer":{"@apply col-start-2":true},".chat-start .chat-image":{"@apply col-start-1":true},".chat-start .chat-bubble":{"@apply col-start-2":true},".chat-start .chat-bubble:before":{"maskImage":"url(\"data:image/svg+xml,%3csvg width='3' height='3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m 0 3 L 3 3 L 3 0 C 3 1 1 3 0 3'/%3e%3c/svg%3e\")"},"[dir=\"rtl\"] .chat-start .chat-bubble:before":{"maskImage":"url(\"data:image/svg+xml,%3csvg width='3' height='3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m 0 3 L 1 3 L 3 3 C 2 3 0 1 0 0'/%3e%3c/svg%3e\")"},".chat-end":{"@apply place-items-end":true,"gridTemplateColumns":"1fr auto"},".chat-end .chat-header":{"@apply col-start-1":true},".chat-end .chat-footer":{"@apply col-start-1":true},".chat-end .chat-image":{"@apply col-start-2":true},".chat-end .chat-bubble":{"@apply col-start-1":true},".chat-end .chat-bubble:before":{"maskImage":"url(\"data:image/svg+xml,%3csvg width='3' height='3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m 0 3 L 1 3 L 3 3 C 2 3 0 1 0 0'/%3e%3c/svg%3e\")"},"[dir=\"rtl\"] .chat-end .chat-bubble:before":{"maskImage":"url(\"data:image/svg+xml,%3csvg width='3' height='3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m 0 3 L 3 3 L 3 0 C 3 1 1 3 0 3'/%3e%3c/svg%3e\")"},".checkbox":{"@apply shrink-0":true},".collapse:not(td):not(tr):not(colgroup)":{"@apply visible":true},".collapse":{"@apply relative grid overflow-hidden":true,"gridTemplateRows":"auto 0fr","transition":"grid-template-rows 0.2s"},".collapse-title,\n.collapse > input[type=\"checkbox\"],\n.collapse > input[type=\"radio\"],\n.collapse-content":{"@apply col-start-1 row-start-1":true},".collapse > input[type=\"checkbox\"],\n.collapse > input[type=\"radio\"]":{"@apply appearance-none opacity-0":true},".collapse-content":{"@apply invisible col-start-1 row-start-2 min-h-0":true,"transition":"visibility 0.2s"},".collapse[open],\n.collapse-open,\n.collapse:focus:not(.collapse-close)":{"gridTemplateRows":"auto 1fr"},".collapse:not(.collapse-close):has(> input[type=\"checkbox\"]:checked),\n.collapse:not(.collapse-close):has(> input[type=\"radio\"]:checked)":{"gridTemplateRows":"auto 1fr"},".collapse[open] > .collapse-content,\n.collapse-open > .collapse-content,\n.collapse:focus:not(.collapse-close) > .collapse-content,\n.collapse:not(.collapse-close) > input[type=\"checkbox\"]:checked ~ .collapse-content,\n.collapse:not(.collapse-close) > input[type=\"radio\"]:checked ~ .collapse-content":{"@apply visible min-h-fit":true},":root .countdown":{"lineHeight":"1em"},".countdown":{"display":"inline-flex"},".countdown > *":{"height":"1em","@apply inline-block overflow-y-hidden":true},".countdown > *:before":{"position":"relative","content":"\"00\\A 01\\A 02\\A 03\\A 04\\A 05\\A 06\\A 07\\A 08\\A 09\\A 10\\A 11\\A 12\\A 13\\A 14\\A 15\\A 16\\A 17\\A 18\\A 19\\A 20\\A 21\\A 22\\A 23\\A 24\\A 25\\A 26\\A 27\\A 28\\A 29\\A 30\\A 31\\A 32\\A 33\\A 34\\A 35\\A 36\\A 37\\A 38\\A 39\\A 40\\A 41\\A 42\\A 43\\A 44\\A 45\\A 46\\A 47\\A 48\\A 49\\A 50\\A 51\\A 52\\A 53\\A 54\\A 55\\A 56\\A 57\\A 58\\A 59\\A 60\\A 61\\A 62\\A 63\\A 64\\A 65\\A 66\\A 67\\A 68\\A 69\\A 70\\A 71\\A 72\\A 73\\A 74\\A 75\\A 76\\A 77\\A 78\\A 79\\A 80\\A 81\\A 82\\A 83\\A 84\\A 85\\A 86\\A 87\\A 88\\A 89\\A 90\\A 91\\A 92\\A 93\\A 94\\A 95\\A 96\\A 97\\A 98\\A 99\\A\"","whiteSpace":"pre","top":"calc(var(--value) * -1em)"},".divider":{"@apply flex flex-row items-center self-stretch":true},".divider:before,\n  .divider:after":{"content":"\"\"","@apply flex-grow":true,"@apply h-0.5 w-full":true},".drawer":{"@apply relative grid":true,"gridAutoColumns":"max-content auto"},".drawer-content":{"@apply col-start-2 row-start-1":true},".drawer-side":{"@apply pointer-events-none fixed left-0 top-0 col-start-1 row-start-1 grid w-full grid-cols-1 grid-rows-1 items-start justify-items-start overflow-y-auto overscroll-contain":true,"height":["100vh","100dvh"],"scrollbarWidth":"none"},".drawer-side::-webkit-scrollbar":{"@apply hidden":true},".drawer-side > .drawer-overlay":{"@apply sticky top-0 place-self-stretch":true},".drawer-side > *":{"@apply col-start-1 row-start-1":true},".drawer-side > *:not(.drawer-overlay)":{"@apply transition duration-300 ease-out":true,"transform":"translateX(100%)"},"[dir=\"rtl\"] .drawer-side > *:not(.drawer-overlay)":{"transform":"translateX(100%)"},".drawer-toggle":{"@apply fixed h-0 w-0 appearance-none opacity-0":true},".drawer-toggle:checked ~ .drawer-side":{"@apply pointer-events-auto visible":true},".drawer-toggle:checked ~ .drawer-side > *:not(.drawer-overlay)":{"transform":"translateX(0%)"},".drawer-end":{"gridAutoColumns":"auto max-content"},".drawer-end .drawer-toggle ~ .drawer-content":{"@apply col-start-1":true},".drawer-end .drawer-toggle ~ .drawer-side":{"@apply col-start-2 justify-items-end":true},".drawer-end .drawer-toggle ~ .drawer-side > *:not(.drawer-overlay)":{"transform":"translateX(-100%)"},".drawer-end .drawer-toggle:checked ~ .drawer-side > *:not(.drawer-overlay)":{"transform":"translateX(0%)"},".dropdown":{"@apply relative inline-block":true},".dropdown > *:not(summary):focus":{"@apply outline-none":true},".dropdown .dropdown-content":{"@apply absolute":true},".dropdown:is(:not(details)) .dropdown-content":{"@apply invisible opacity-0":true},".dropdown-end .dropdown-content":{"@apply right-0":true},".dropdown-left .dropdown-content":{"@apply bottom-auto right-full top-0":true},".dropdown-right .dropdown-content":{"@apply bottom-auto left-full top-0":true},".dropdown-bottom .dropdown-content":{"@apply bottom-auto top-full":true},".dropdown-top .dropdown-content":{"@apply bottom-full top-auto":true},".dropdown-end.dropdown-right .dropdown-content":{"@apply bottom-0 top-auto":true},".dropdown-end.dropdown-left .dropdown-content":{"@apply bottom-0 top-auto":true},".dropdown.dropdown-open .dropdown-content,\n.dropdown:not(.dropdown-hover):focus .dropdown-content,\n.dropdown:focus-within .dropdown-content":{"@apply visible opacity-100":true},"@media (hover: hover)":{".dropdown.dropdown-hover:hover .dropdown-content":{"@apply visible opacity-100":true}},".dropdown:is(details) summary::-webkit-details-marker":{"@apply hidden":true},".file-input":{"@apply h-12 flex-shrink pr-4 text-sm leading-loose":true},".file-input::file-selector-button":{"@apply mr-4 inline-flex h-full flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center px-4 text-center text-sm transition duration-200 ease-out":true,"lineHeight":"1em"},".footer":{"@apply grid w-full grid-flow-row place-items-start":true},".footer > *":{"@apply grid place-items-start":true},".footer-center":{"@apply place-items-center text-center":true},".footer-center > *":{"@apply place-items-center":true},"@media (min-width: 48rem)":{".footer":{"gridAutoFlow":"column"},".footer-center":{"gridAutoFlow":"row dense"}},".form-control":{"@apply flex flex-col":true},".label":{"@apply flex select-none items-center justify-between":true},".hero":{"@apply grid w-full place-items-center bg-cover bg-center":true},".hero > *":{"@apply col-start-1 row-start-1":true},".hero-overlay":{"@apply col-start-1 row-start-1 h-full w-full":true},".hero-content":{"@apply z-0 flex items-center justify-center":true},".indicator":{"@apply relative inline-flex":true,"width":"max-content"},".indicator :where(.indicator-item)":{"zIndex":"1","@apply absolute transform whitespace-nowrap":true},".input":{"@apply flex-shrink":true,"@apply h-12 px-4 text-sm leading-loose":true},".input-group":{"@apply flex w-full items-stretch":true},".input-group > .input":{"@apply isolate":true},".input-group > *,\n  .input-group > .input,\n  .input-group > .textarea,\n  .input-group > .select":{"@apply rounded-none":true},".input-group-md":{"@apply text-sm leading-loose":true},".input-group-lg":{"@apply text-lg leading-loose":true},".input-group-sm":{"@apply text-sm leading-8":true},".input-group-xs":{"@apply text-xs leading-relaxed":true},".input-group :where(span)":{"@apply bg-base-300 flex items-center px-4":true},".input-group > :first-child":{"borderTopRightRadius":"var(--rounded-btn, 0.5rem)","borderTopLeftRadius":"0","borderBottomRightRadius":"var(--rounded-btn, 0.5rem)","borderBottomLeftRadius":"0"},".input-group > :last-child":{"borderTopRightRadius":"0","borderTopLeftRadius":"var(--rounded-btn, 0.5rem)","borderBottomRightRadius":"0","borderBottomLeftRadius":"var(--rounded-btn, 0.5rem)"},".input-group-vertical":{"@apply flex-col":true},".input-group-vertical :first-child":{"borderTopRightRadius":"var(--rounded-btn, 0.5rem)","borderTopLeftRadius":"var(--rounded-btn, 0.5rem)","borderBottomRightRadius":"0","borderBottomLeftRadius":"0"},".input-group-vertical :last-child":{"borderTopRightRadius":"0","borderTopLeftRadius":"0","borderBottomRightRadius":"var(--rounded-btn, 0.5rem)","borderBottomLeftRadius":"var(--rounded-btn, 0.5rem)"},".join":{"@apply inline-flex items-stretch":true},".join :where(.join-item)":{"borderStartEndRadius":"0","borderEndEndRadius":"0","borderEndStartRadius":"0","borderStartStartRadius":"0"},".join .join-item:not(:first-child):not(:last-child),\n  .join *:not(:first-child):not(:last-child) .join-item":{"borderStartEndRadius":"0","borderEndEndRadius":"0","borderEndStartRadius":"0","borderStartStartRadius":"0"},".join .join-item:first-child:not(:last-child),\n  .join *:first-child:not(:last-child) .join-item":{"borderStartEndRadius":"0","borderEndEndRadius":"0"},".join .dropdown .join-item:first-child:not(:last-child),\n  .join *:first-child:not(:last-child) .dropdown .join-item":{"borderStartEndRadius":"inherit","borderEndEndRadius":"inherit"},".join :where(.join-item:first-child:not(:last-child)),\n  .join :where(*:first-child:not(:last-child) .join-item)":{"borderEndStartRadius":"inherit","borderStartStartRadius":"inherit"},".join .join-item:last-child:not(:first-child),\n  .join *:last-child:not(:first-child) .join-item":{"borderEndStartRadius":"0","borderStartStartRadius":"0"},".join :where(.join-item:last-child:not(:first-child)),\n  .join :where(*:last-child:not(:first-child) .join-item)":{"borderStartEndRadius":"inherit","borderEndEndRadius":"inherit"},"@supports not selector(:has(*))":{":where(.join *)":{"@apply rounded-[inherit]":true}},"@supports selector(:has(*))":{":where(.join *:has(.join-item))":{"@apply rounded-[inherit]":true}},".kbd":{"@apply inline-flex items-center justify-center":true},".link":{"@apply cursor-pointer underline":true},".link-hover":{"@apply no-underline [@media(hover:hover)]:hover:underline":true},".mask":{"maskSize":"contain","maskRepeat":"no-repeat","maskPosition":"center"},".mask-half-1":{"maskSize":"200%","maskPosition":"left"},".mask-half-2":{"maskSize":"200%","maskPosition":"right"},".menu":{"@apply flex flex-col flex-wrap text-sm":true},".menu :where(li ul)":{"@apply relative whitespace-nowrap":true},".menu :where(li:not(.menu-title) > *:not(ul):not(details):not(.menu-title)),\n  .menu :where(li:not(.menu-title) > details > summary:not(.menu-title))":{"@apply grid grid-flow-col content-start items-center gap-2":true,"gridAutoColumns":"minmax(auto, max-content) auto max-content","userSelect":"none"},".menu li.disabled":{"@apply cursor-not-allowed select-none":true},".menu :where(li > .menu-dropdown:not(.menu-dropdown-show))":{"@apply hidden":true},":where(.menu li)":{"@apply relative flex shrink-0 flex-col flex-wrap items-stretch":true},":where(.menu li) .badge":{"@apply justify-self-end":true},".mockup-code":{"@apply relative overflow-hidden overflow-x-auto":true},".mockup-code pre[data-prefix]:before":{"content":"attr(data-prefix)","@apply inline-block text-right":true},".mockup-window":{"@apply relative overflow-hidden overflow-x-auto":true},".mockup-window pre[data-prefix]:before":{"content":"attr(data-prefix)","@apply inline-block text-right":true},".mockup-browser":{"@apply relative overflow-hidden overflow-x-auto":true},".mockup-browser pre[data-prefix]:before":{"content":"attr(data-prefix)","@apply inline-block text-right":true},".modal":{"@apply pointer-events-none fixed inset-0 m-0 grid h-full max-h-none w-full max-w-none justify-items-center p-0 opacity-0":true,"overscrollBehavior":"contain","zIndex":"999"},".modal-scroll":{"overscrollBehavior":"auto"},":where(.modal)":{"@apply items-center":true},".modal-box":{"maxHeight":"calc(100vh - 5em)"},".modal-open,\n.modal:target,\n.modal-toggle:checked + .modal,\n.modal[open]":{"@apply pointer-events-auto visible opacity-100":true},".modal-action":{"@apply flex":true},".modal-toggle":{"@apply fixed h-0 w-0 appearance-none opacity-0":true},":root:has(:is(.modal-open, .modal:target, .modal-toggle:checked + .modal, .modal[open]))":{"@apply overflow-hidden":true},".navbar":{"@apply flex items-center":true},":where(.navbar > *)":{"@apply inline-flex items-center":true},".navbar-start":{"width":"50%","justifyContent":"flex-start"},".navbar-center":{"flexShrink":"0"},".navbar-end":{"width":"50%","justifyContent":"flex-end"},".progress":{"@apply relative w-full appearance-none overflow-hidden":true},".radial-progress":{"@apply relative inline-grid h-[var(--size)] w-[var(--size)] place-content-center rounded-full bg-transparent":true,"verticalAlign":"middle","boxSizing":"content-box"},".radial-progress::-moz-progress-bar":{"@apply appearance-none bg-transparent":true},".radial-progress::-webkit-progress-value":{"@apply appearance-none bg-transparent":true},".radial-progress::-webkit-progress-bar":{"@apply appearance-none bg-transparent":true},".radial-progress:before,\n.radial-progress:after":{"@apply absolute rounded-full":true,"content":"\"\""},".radial-progress:before":{"@apply inset-0":true,"background":"radial-gradient(farthest-side, currentColor 98%, #0000) top/var(--thickness) var(--thickness)\n      no-repeat,\n    conic-gradient(currentColor calc(var(--value) * 1%), #0000 0)","WebkitMask":"radial-gradient(\n    farthest-side,\n    #0000 calc(99% - var(--thickness)),\n    #000 calc(100% - var(--thickness))\n  )","mask":"radial-gradient(\n    farthest-side,\n    #0000 calc(99% - var(--thickness)),\n    #000 calc(100% - var(--thickness))\n  )"},".radial-progress:after":{"inset":"calc(50% - var(--thickness) / 2)","transform":"rotate(calc(-1*(var(--value) * 3.6deg - 90deg))) translate(calc(-1*(var(--size) / 2 - 50%)))"},".radio":{"@apply shrink-0":true},".range":{"@apply h-6 w-full cursor-pointer":true},".range:focus":{"outline":"none"},".rating":{"@apply relative inline-flex":true},".rating :where(input)":{"@apply cursor-pointer rounded-none":true},".select":{"@apply inline-flex cursor-pointer select-none appearance-none":true,"@apply min-h-12 h-12 pl-4 pr-10 text-sm leading-loose":true},".select[multiple]":{"@apply h-auto":true},".stack":{"@apply inline-grid":true},".stack > *":{"@apply col-start-1 row-start-1":true,"transform":"translateY(10%) scale(0.9)","zIndex":"1"},".stack > *:nth-child(2)":{"transform":"translateY(5%) scale(0.95)","zIndex":"2"},".stack > *:nth-child(1)":{"transform":"translateY(0) scale(1)","zIndex":"3"},".stats":{"@apply inline-grid":true},":where(.stats)":{"@apply grid-flow-col":true},".stat":{"@apply inline-grid w-full":true,"gridTemplateColumns":"repeat(1, 1fr)"},".stat-figure":{"@apply col-start-2 row-span-3 row-start-1 place-self-center justify-self-end":true},".stat-title":{"@apply col-start-1 whitespace-nowrap":true},".stat-value":{"@apply col-start-1 whitespace-nowrap":true},".stat-desc":{"@apply col-start-1 whitespace-nowrap":true},".stat-actions":{"@apply col-start-1 whitespace-nowrap":true},".steps":{"@apply inline-grid grid-flow-col overflow-hidden overflow-x-auto":true,"counterReset":"step","gridAutoColumns":"1fr"},".steps .step":{"@apply grid grid-cols-1 grid-rows-2 place-items-center text-center":true},".swap":{"@apply relative inline-grid select-none place-content-center":true},".swap > *":{"@apply col-start-1 row-start-1":true},".swap input":{"@apply appearance-none":true},".swap .swap-on,\n.swap .swap-indeterminate,\n.swap input:indeterminate ~ .swap-on":{"@apply opacity-0":true},".swap input:checked ~ .swap-off,\n.swap-active .swap-off,\n.swap input:indeterminate ~ .swap-off":{"@apply opacity-0":true},".swap input:checked ~ .swap-on,\n.swap-active .swap-on,\n.swap input:indeterminate ~ .swap-indeterminate":{"@apply opacity-100":true},".tabs":{"@apply flex flex-wrap items-end":true},".tab":{"@apply relative inline-flex cursor-pointer select-none flex-wrap items-center justify-center text-center":true,"@apply h-8 text-sm leading-loose":true,"-TabPadding":"1rem"},".table":{"@apply relative w-full":true},".table :where(.table-pin-rows thead tr)":{"@apply bg-base-100 sticky top-0 z-[1]":true},".table :where(.table-pin-rows tfoot tr)":{"@apply bg-base-100 sticky bottom-0 z-[1]":true},".table :where(.table-pin-cols tr th)":{"@apply bg-base-100 sticky left-0 right-0":true},".table-zebra tbody tr:nth-child(even) :where(.table-pin-cols tr th)":{"@apply bg-base-200":true},".textarea":{"@apply min-h-12 flex-shrink":true,"@apply px-4 py-2 text-sm leading-loose":true},".toast":{"@apply fixed flex min-w-fit flex-col whitespace-nowrap":true},".toggle":{"@apply shrink-0":true}}