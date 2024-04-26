<template>
    <div grid gap-4 :class="getColumnNum()">
        <div v-for="(emoticon, index) in emoticons" :key="index" @click="$emit('select', emoticon)">
            <img :src="emoticon.url" w-full rounded-2 :class="{ 'filter-brightness-50': emoticon.perm !== 1 }" />
            <div text-10px text-center color="white/70" mt-2>{{ emoticon.emoji }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {  Emoticons } from '@/types'
defineOptions({ name: 'EmojiTab' })

defineEmits<{
    (e: 'select', emoticon: Emoticons): void
}>()
const props = defineProps<{
    type: number
    emoticons: Emoticons[]
}>()

function getColumnNum() {
    const { type } = props
    if (type === 3) {
        return 'grid-cols-8 '
    } else if (type === 1) {
        return 'grid-cols-4'
    } else {
        return 'grid-cols-5'
    }
}

</script>