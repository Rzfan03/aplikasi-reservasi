import Swal from 'sweetalert2'

export const swal = Swal.mixin({
  background: 'var(--card)',
  color: 'var(--card-foreground)',
  confirmButtonColor: 'var(--primary)',
  confirmButtonText: 'Ya',
  cancelButtonText: 'Batal',
  showCancelButton: true,
  customClass: {
    popup: 'swal-theme',
    title: 'swal-title',
    htmlContainer: 'swal-html',
    confirmButton: 'swal-confirm',
    cancelButton: 'swal-cancel',
  },
  buttonsStyling: false,
  reverseButtons: true,
})

export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  background: 'var(--card)',
  color: 'var(--card-foreground)',
  customClass: {
    popup: 'swal-theme swal-toast',
  },
})

export function confirmDanger(title: string, text?: string) {
  return swal.fire({
    title,
    html: text,
    icon: 'warning',
    iconColor: 'var(--destructive)',
    confirmButtonColor: 'var(--destructive)',
    confirmButtonText: 'Hapus',
  })
}

export function toastSuccess(message: string) {
  return toast.fire({ icon: 'success', title: message })
}