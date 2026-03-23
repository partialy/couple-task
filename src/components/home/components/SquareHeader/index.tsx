import React, { useCallback, useMemo } from "react";
import { Search } from "lucide-react";

import LocationWeather from "@/components/LocationWeather";
import { useUserStore } from "@/store";
import { notification } from "@/utils/pure/notification";

interface SquareHeaderProps {
  variant?: "full" | "searchOnly";
}

const GREET_CONTENTS = [
  "今天心情几分呀？我想听你说说。",
  "忙了一天，记得给自己一点奖励。",
  "现在的你，是在努力还是在摸鱼呢？",
  "我路过来看看你，顺便收一份今日可爱。",
  "今天有发生什么小确幸吗？",
  "累了就歇一会儿，我在这儿陪你。",
  "有按时吃饭吗？不许敷衍自己。",
  "今天最想和我分享的一件事是什么？",
  "工作学习辛苦啦，给你一个抱抱。",
  "今天有没有被谁夸到开心一下？",
  "如果现在能许个小愿望，你会许什么？",
  "记得喝口水，再继续发光。",
  "我来打卡啦，看看你今天状态如何。",
  "今天遇到的难题，想不想一起拆解？",
  "你现在的表情，应该很可爱吧。",
  "今天有没有偷偷想我一秒钟？",
  "辛苦的时候别硬扛，告诉我一声。",
  "今天最值得纪念的一刻是什么？",
  "先深呼吸一下，我们慢慢来。",
  "此刻的你，已经很棒了。",
  "想你的一天又开始啦，先给你一个亲亲。",
  "你一出现，我今天的心情就自动加分。",
  "忙归忙，别忘了想我一下下。",
  "报告宝贝：我又偷偷喜欢你多一点了。",
  "今天也要被我偏爱，听到了吗？",
  "如果累了就靠过来，我一直在。",
  "看到你名字就会笑，这事我不装了。",
  "你今天也会是我最想炫耀的人。",
  "等你有空，来收我准备好的抱抱。",
  "今天的甜度指标：你回复我就超标。",
  "宝贝，记得按时吃饭，我会查岗的。",
  "我想你不是说说而已，是每隔几分钟一次。",
  "今天的风有点甜，像你在我耳边说话。",
  "你忙你的，我负责在心里乖乖等你。",
  "再难的一天，想到你我就有劲了。",
  "你是我今天的第一件开心事。",
  "想和你分享所有小事，包括想你这件大事。",
  "别太辛苦啦，我会心疼的。",
  "给你一张今日恋爱券：可兑换抱抱一次。",
  "你只要在，我就觉得生活很值得。",
  "今天也想做你的小确幸。",
  "一想到晚上能和你说话，我就很期待。",
  "你的存在本身，就是我的安稳感。",
  "今天有没有乖乖的？我来检查一下。",
  "你负责发光，我负责夸你。",
  "我把想你写进了今天的待办清单。",
  "遇见你之后，连日常都变成了浪漫。",
  "今天也继续做彼此最坚定的那个人吧。",
  "想把今天的温柔都给你，独家供应。",
  "不管几点，你都是我最想联系的人。",
  "喂喂喂，今天份的想你你签收了吗？",
  "报告恋爱总部：我又对你心动了一次。",
  "本日任务：逗你笑，已开始执行。",
  "快让我看看，谁家宝贝这么好看。",
  "你负责可爱，我负责一直心动。",
  "今天也要做我的快乐制造机哦。",
  "听说你很忙？那我负责可爱打扰一下。",
  "想你这件事，我已经练到满级了。",
  "今日份黏人额度，申请全部给你。",
  "你一回复，我这边就像中了奖。",
  "小提醒：你是我的心动常驻嘉宾。",
  "今天也想把你拐去吃好吃的。",
  "你的名字是我最常点开的通知。",
  "我在认真生活，也在认真喜欢你。",
  "你出现的地方，空气都在冒粉红泡泡。",
  "今天要不要和我比谁更想谁？",
  "我宣布：你是今日最佳可爱担当。",
  "想你到什么程度呢？连风都知道。",
  "快来，给我一个线上抱抱续命。",
  "你别动，我去把浪漫搬过来给你。",
  "想和你把平凡日子过成小电影。",
  "你是我每天最想打开的那一页。",
  "你的声音，是我最爱的背景音。",
  "和你聊天的时候，时间都过得很快。",
  "我想把所有好心情都分你一半。",
  "只要你在，晚风都变得温柔。",
  "你不说话也没关系，我会一直在。",
  "今天的疲惫，在想到你时都变轻了。",
  "你就是我忙碌生活里的小糖块。",
  "你是我偷偷珍藏的浪漫答案。",
  "我把心事折成纸飞机，飞向你。",
  "今天也在心里给你留了最软的位置。",
  "能和你一起变好，是我最喜欢的事。",
  "你一句在吗，就能让我安心很久。",
  "如果想念有声音，现在一定很热闹。",
  "你是我反复确认过的偏爱。",
  "你不用完美，做你自己就很迷人。",
  "慢慢来，我们会有很多很多以后。",
  "我会在你需要的时候，第一时间抱紧你。",
  "你努力的样子，真的很让我心疼又骄傲。",
  "愿你今天顺顺利利，也被温柔以待。",
  "别怕，我们是站在同一边的人。",
  "你不必逞强，在我这里可以软一点。",
  "我想做你低落时第一个想到的人。",
  "今天也给你一份坚定：我在。",
  "如果世界吵闹，就来我这儿躲一会儿。",
  "你开心我就跟着开心，你难过我就陪着你。",
  "你已经很棒了，别对自己太苛刻。",
  "我想把我的偏爱写成你的底气。",
  "愿我们把每个普通日子都过得有光。",
  "你永远值得被认真喜欢、认真对待。",
  "今天不管多晚，我都等你一句晚安。",
  "有我在，你可以放心做个小朋友。",
  "我会一直为你鼓掌，也一直抱着你。",
  "你是我想认真走很久很久的人。",
  "希望你今天平安、顺利、被爱包围。",
  "别担心未来，我们一步一步一起走。",
  "你一回头，我就会在你身后。",
  "愿你被世界温柔相待，也被我偏爱到底。"
];

/**
 * 任务广场头部（标题/天气/搜索）
 */
export default function SquareHeader({ variant = "full" }: SquareHeaderProps) {
  const currentUser = useUserStore((state) => state.currentUser);

  const greetText = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 6 && hours < 10) return "早上好";
    if (hours >= 10 && hours < 13) return "中午好";
    if (hours >= 13 && hours < 17) return "下午好";
    if (hours >= 17 && hours < 19) return "傍晚了";
    if (hours >= 19 && hours < 23) return "晚上好";
    if (hours >= 23 || hours < 1) return "早点休息";
    return "修仙中";
  }, []);

  const bind = useUserStore((s) => s.bindUser);

  const onGreet = useCallback(() => {
    const content =
      GREET_CONTENTS[Math.floor(Math.random() * GREET_CONTENTS.length)];
    notification.show({
      title: `${greetText}，想我了吗`,
      content,
      position: "center",
      image: bind?.avatar,
      onClick: () => {},
    });
  }, []);

  return (
    <>
      {/* 头部标题/天气（可选渲染） */}
      {variant !== "searchOnly" && (
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-2xl font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
            onClick={onGreet}
          >
            {currentUser?.nickname
              ? `${greetText}，${currentUser?.nickname}`
              : greetText}
          </h2>
          <LocationWeather />
        </div>
      )}

      {variant !== "full" ? (
        <div className="flex space-x-2">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:focus:ring-cyan-500 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm"
              placeholder="搜索你们的心愿任务..."
            />
          </div>
          <button className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-2xl shadow-sm transition-colors shrink-0">
            搜索
          </button>
        </div>
      ) : null}
    </>
  );
}
