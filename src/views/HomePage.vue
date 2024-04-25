<template>
  <ion-page>
    <div class="p-4">

      <div calss="w-full">
        <div flex gap-2 overflow-x-auto>
          <div v-for="(item, index) in rooms" :key="index" @click="() => currentRoomId = item.roomInfo.roomId"
            class="flex flex-shrink-0 justify-between items-center gap-2 p2 rounded-2 bg-white/10">
            <div size-40px rounded-2 overflow-hidden>
              <img :src="item.roomInfo.face" />
            </div>
            <div>{{ item.roomInfo.name }}</div>
          </div>
        </div>
      </div>


      <div mt-2 p2 box-border bg="white/10" rounded-2>
        <div flex gap-2 overflow-x-auto>
          <div v-for="item in currentRoom?.emoticons" :key="item.pkg_id" size-40px flex-shrink-0
            @click="currentPkgId = item.pkg_id">
            <img :src="item.current_cover" />
          </div>
        </div>
      </div>

      <div mt-2 p2 box-border bg="white/10" rounded-2>
        <template v-for="pkg in currentRoom?.emoticons" :key="pkg.pkg_id">
          <div flex gap-2 flex-wrap h-200px overflow-y-auto v-if="currentPkgId === pkg.pkg_id">
            <div v-for="(emoticon, index) in pkg.emoticons" :key="index" size-40px flex-shrink-0
              @click="selectEmoji(pkg, emoticon)">
              <img :src="emoticon.url" />
            </div>
          </div>
        </template>
      </div>


      <div mt-2 flex flex-col gap-2 h-180px>
        <ion-input placeholder="请输入弹幕内容"></ion-input>
        <ion-button class="w-full h-12 text-4">发送</ion-button>
        <ion-button class="w-full h-12 text-4" @click="getRooms">刷新</ion-button>
      </div>

    </div>

  </ion-page>

</template>

<script setup lang="ts">
// import { Settings } from 'lucide-vue-next';
import { IonPage, IonButton, IonInput } from '@ionic/vue';
import { EmoticonsMap, Emoticons } from '@/types'
import { computed, ref } from 'vue';
import { httpGet, httpPost } from '@/utils/http';

interface RoomInfo {
  uid: string // 账号id
  roomId: string // 房间id
  shortId: string // 房间短号, 没有时为0
  name: string // 主播名字
  face: string // 头像
  liveStatus: number // 直播状态, 0 下播, 1 直播, 2 轮播
  tags: string // 主播的标签
  title: string // 直播标题
  medalName: string // 粉丝牌名字
  keyframe: string // 封面
}

interface Rooms {
  id: number,
  roomInfo: RoomInfo,
  emoticons: EmoticonsMap[]
}

const currentRoomId = ref<string>()
const currentPkgId = ref<number>()
const rooms = ref<Rooms[]>([])
const currentRoom = computed(() => {
  return rooms.value.find((item) => item.roomInfo.roomId === currentRoomId.value)
})

function initData() {
  currentRoomId.value = rooms.value[0].roomInfo.roomId
  currentPkgId.value = rooms.value[0].emoticons[0].pkg_id
}

const getRooms = async () => {
  const response = await httpGet<Rooms[]>('/get')
  const { data } = response
  rooms.value = data
  if (currentRoomId.value) {
    const findRoom = data.find((item) => item.roomInfo.roomId === currentRoomId.value)
    if (!findRoom) initData()
  } else {
    initData()
  }
}

const sendEmoticon = async (pkgId: number, emoticonUnique: string) => {
  alert(currentRoom.value.id)
  if (!currentRoom.value) throw new Error('当前房间不存在')
  await httpPost<Rooms[]>('/send/emoji', {
    emoticonUnique,
    pkgId,
    winId: currentRoom.value.id
  })
}

const sendText = async (content: string) => {
  if (!currentRoom.value) throw new Error('当前房间不存在')
  await httpPost<Rooms[]>('/send/text', {
    content,
    winId: currentRoom.value.id
  })
}

function selectEmoji(pkg: EmoticonsMap, emoticons: Emoticons) {
  if (pkg.pkg_type === 3) {
    alert(pkg.pkg_type)
  } else {
    if (emoticons.perm === 1) {
      sendEmoticon(pkg.pkg_id, emoticons.emoticon_unique)
    }
  }
}

getRooms()
</script>

<style scoped></style>