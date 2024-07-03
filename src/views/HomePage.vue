<template>
  <ion-page>
    <div class="p-4 flex flex-col gap2">
      <!-- 已打开的房间列表 -->
      <div flex justify-between>
        <div flex gap-2 overflow-x-auto ref="roomsWrapRef">
          <div v-for="(item, index) in rooms" :key="index" :id="`room_id_${item.roomInfo.roomId}`"
            @click="switchRoom(item.roomInfo.roomId)"
            class="flex gap-2 p2 rounded-2 bg-white/10 border-2px border-solid transition-all"
            flex="shrink-0 justify-between items-center" :class="[
              currentRoomId === item.roomInfo.roomId ? 'border-#fb7299/70' : 'border-transparent'
            ]">
            <div size-40px rounded-2 overflow-hidden>
              <img :src="item.roomInfo.face" />
            </div>
            <div>{{ item.roomInfo.name }}</div>
          </div>
        </div>

        <div flex items-center>
          <ion-button size-50px p-0 fill="clear" @click="getRooms">
            <RotateCcw :size="6" />
          </ion-button>
        </div>
      </div>

      <div flex gap-2 items-center>
        <ion-input placeholder="请输入弹幕捏" v-model="content" h-40px @keyup.enter="send" :counter="true"
          :maxlength="maxlen"></ion-input>
      </div>

      <div p2 mt-18px box-border bg="white/10" rounded-2>
        <div flex gap-2 overflow-x-auto h-40px>
          <div v-for="item in currentRoom?.emoticons" :key="item.pkg_id" size-40px flex-shrink-0 p1 rounded-2
            transition-all :class="{ 'bg-white/20': item.pkg_id === currentPkgId }" @click="currentPkgId = item.pkg_id">
            <img :src="item.current_cover" rounded-2 />
          </div>
        </div>
      </div>

      <div p2 box-border bg="white/10" rounded-2 overflow-y-auto h-200px>
        <template v-for="pkg in currentRoom?.emoticons" :key="pkg.pkg_id">
          <template v-if="currentPkgId === pkg.pkg_id">
            <template v-if="pkg.used.length > 0">
              <div text-14px mb-2>最近使用</div>
              <emoji-tab :emoticons="pkg.used" :type="pkg.pkg_type" mb-4
                @select="(emoticon) => selectEmoji(pkg, emoticon)"></emoji-tab>
              <div text-14px mb-2>全部表情</div>
            </template>
            <emoji-tab :emoticons="pkg.emoticons" :type="pkg.pkg_type"
              @select="(emoticon) => selectEmoji(pkg, emoticon)"></emoji-tab>
          </template>

        </template>
      </div>

      <ion-button class="w-full h-12 text-4" @click="send" m0>
        发送
      </ion-button>

      <ion-button class="w-full h-12 text-4" m0 @click="router.push('/scanning')">
        连接
      </ion-button>

      <div flex gap-2>
        <ion-button class="h-12 w-full text-4 m0" @click="changeVolume(0)">
          <Plus :size="5" :stroke-width="3" />
        </ion-button>
        <ion-button class="h-12 w-full text-4 m0" @click="changeVolume(1)">
          <Minus :size="5" :stroke-width="3" />
        </ion-button>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { RotateCcw, Minus, Plus } from 'lucide-vue-next';
import { IonPage, IonButton, IonInput, onIonViewDidEnter } from '@ionic/vue'
import { EmoticonsMap, Emoticons, Rooms, GetData } from '@/types'
import { computed, ref } from 'vue'
import EmojiTab from '@/components/EmojiTab.vue'
import router from '@/router';
import { useConfigStore } from '@/stores'
import axios from 'axios';
import { completeUrl } from '@/utils/api';

const configStore = useConfigStore()
const roomsWrapRef = ref<HTMLDivElement>()
const currentRoomId = ref<string>()
const currentPkgId = ref<number>()
const rooms = ref<Rooms[]>([])
const maxlen = ref(20)
const content = ref('')
const currentRoom = computed(() => {
  return rooms.value.find((item) => item.roomInfo.roomId === currentRoomId.value)
})

const createApi = () => {
  const url = completeUrl(configStore.ip ?? '')
  return axios.create({
    baseURL: configStore.ip ? `http://${url}` : '',
    headers: configStore.token ? {
      Authorization: configStore.token
    } : {}
  })
}

let api = createApi()

function initData() {
  if (rooms.value.length > 0) {
    currentRoomId.value = rooms.value[0].roomInfo.roomId
    currentPkgId.value = rooms.value[0].emoticons[0].pkg_id
  }
}

async function getRooms() {
  const response = await api.get<GetData>('/get')
  const { data } = response

  rooms.value = data.rooms
  maxlen.value = data.maxlen

  if (currentRoomId.value) {
    const findRoom = data.rooms.find((item) => item.roomInfo.roomId === currentRoomId.value)
    if (!findRoom) initData()
  } else {
    initData()
  }
}

function send() {
  if (content.value.length <= 20) {
    sendText(content.value)
  }
}

const sendEmoticon = async (pkgId: number, emoticonUnique: string) => {
  if (!currentRoom.value) throw new Error('当前房间不存在')
  await api.post('/send/emoji', {
    emoticonUnique,
    pkgId,
    winId: currentRoom.value.id
  })
}

async function sendText(msg: string) {
  if (!currentRoom.value) throw new Error('当前房间不存在')
  await api.post('/send/text', {
    content: msg,
    winId: currentRoom.value.id
  })
  content.value = ''
}

async function changeVolume(direction: number) {
  if (!currentRoom.value) throw new Error('当前房间不存在')
  await api.post('/change/volume', {
    direction,
    winId: currentRoom.value.id
  })
}

async function selectEmoji(pkg: EmoticonsMap, emoticons: Emoticons) {
  if (pkg.pkg_type === 3) {
    const tmp = content.value + emoticons.emoji
    if (tmp.length <= maxlen.value) {
      content.value += emoticons.emoji
    }

  } else {
    if (emoticons.perm === 1) {
      sendEmoticon(pkg.pkg_id, emoticons.emoticon_unique)
    }
  }
}

function switchRoom(roomId: string) {
  if (currentRoomId.value === roomId) return
  currentRoomId.value = roomId
  currentPkgId.value = currentRoom.value?.emoticons[0].pkg_id
  content.value = ''

  const el = document.querySelector<HTMLDivElement>(`#room_id_${roomId}`)
  if (el && roomsWrapRef.value) {
    const { offsetLeft, clientLeft } = el
    const { paddingLeft, gap } = window.getComputedStyle(el)

    roomsWrapRef.value.scrollTo({
      left: offsetLeft - clientLeft - parseInt(paddingLeft) - parseInt(gap),
      behavior: 'smooth'
    })
  }

}


async function loop(interval = 1000 * 60) {
  getRooms().finally(() => setTimeout(() => loop(interval), interval))
}

onIonViewDidEnter(() => {
  if (configStore.ip && configStore.token) {
    api = createApi()
    loop()
  }
})
</script>

<style scoped></style>
