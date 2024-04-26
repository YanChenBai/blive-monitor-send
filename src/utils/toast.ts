import { toastController } from '@ionic/vue'

export async function toast(msg: string) {
  const toast = await toastController.create({
    message: msg,
    duration: 1500,
    position: 'bottom'
  })

  await toast.present()

  return toast
}
