<template>
    <ion-page>
        <ion-button size-24 absolute bottom-50 left-50vw translate-x="-50%" shape="round" v-show="!show"
            @click="router.push('/')">关闭</ion-button>

        <div w-full absolute bottom-0 top-0 flex items-center justify-center v-show="show">
            <div text-20px px-3 py-2 rounded-2 text-black bg="[#fb7299]">正在检测二维码是否可用...</div>
        </div>
    </ion-page>
</template>

<script setup lang="ts">
import router from '@/router';
import { toast } from '@/utils/toast';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { StatusBar } from '@capacitor/status-bar';
import { IonPage, IonButton, onIonViewDidEnter, onIonViewWillLeave } from '@ionic/vue';
import axios from 'axios';
import { ref } from 'vue';
import { useConfigStore } from '@/stores'
import { completeUrl } from '@/utils/api';

defineOptions({ name: 'ScanningPage' })

const configStore = useConfigStore()
const show = ref(false)
const loading = ref(false)
async function startScan() {
    await BarcodeScanner.checkPermission({ force: true });

    await BarcodeScanner.hideBackground();

    const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] }); // start scanning and wait for a result

    await BarcodeScanner.showBackground();

    await stop()

    loading.value = true

    try {
        if (!result.hasContent) throw new Error()

        const { ip, token } = JSON.parse(result.content) as { ip?: string, token?: string }

        if (!ip || !token) throw new Error()

        const url = completeUrl(ip)

        const res = await axios.get(`http://${url}/check`, {
            headers: {
                Authorization: token
            }
        })

        if (res.status === 200) {
            toast('连接成功')
            configStore.ip = ip
            configStore.token = token
        }

    } catch (error) {
        toast('无效二维码')
    }

    loading.value = false

    router.push('/')
}

async function start() {
    document.querySelector<HTMLBodyElement>('body')?.classList.add('scanner-active');
    await startScan()
    await StatusBar.hide();
    await StatusBar.setOverlaysWebView({ overlay: true });
    show.value = true
}

async function stop() {
    document.querySelector<HTMLBodyElement>('body')?.classList.remove('scanner-active');
    await StatusBar.show();
    await StatusBar.setOverlaysWebView({ overlay: false });
    await BarcodeScanner.stopScan()
    await BarcodeScanner.showBackground()
    show.value = false
}


onIonViewDidEnter(() => start())

onIonViewWillLeave(() => stop())

</script>