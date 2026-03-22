import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Camera, User, Phone, Mail, Calendar, Heart, Smile, MapPin, Award } from 'lucide-react';
import { useUserStore } from '@/store';
import { message } from '@/utils/pure/message';
import { uploadToQiniu, createLocalPreview, revokeLocalPreview } from '@/utils/qiniu';
import { datePicker } from '@/utils/pure/datePicker';
import { formatDateToYmd } from '@/utils/pure/formatDate';

interface ProfileEditProps {
  onBack: () => void;
}

export default function ProfileEdit({ onBack }: ProfileEditProps) {
  const { currentUser, updateProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const [nickname, setNickname] = useState(currentUser?.nickname || currentUser?.username || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [gender, setGender] = useState(currentUser?.gender || 'other');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [birthday, setBirthday] = useState(currentUser?.birthday ? new Date(currentUser.birthday).toISOString().split('T')[0] : '');
  const [anniversary, setAnniversary] = useState(currentUser?.anniversary ? new Date(currentUser.anniversary).toISOString().split('T')[0] : '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        revokeLocalPreview(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarPreview) {
        revokeLocalPreview(avatarPreview);
      }
      const preview = createLocalPreview(file);
      setAvatarPreview(preview);
      setAvatarFile(file);
    }
  };

  const openBirthdayPicker = () => {
    datePicker.show({
      lang: 'zh',
      initialDate: birthday ? new Date(`${birthday}T12:00:00`) : new Date(),
      onSelect: (d) => setBirthday(formatDateToYmd(d)),
    });
  };

  const openAnniversaryPicker = () => {
    datePicker.show({
      lang: 'zh',
      initialDate: anniversary ? new Date(`${anniversary}T12:00:00`) : new Date(),
      onSelect: (d) => setAnniversary(formatDateToYmd(d)),
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let finalAvatar = avatar;

      if (avatarFile) {
        try {
          finalAvatar = await uploadToQiniu(avatarFile, 'avatar');
        } catch (error) {
          message.error('头像上传失败，请稍后重试');
          setIsLoading(false);
          return;
        }
      }

      const success = await updateProfile({
        nickname,
        title,
        gender,
        phone,
        email,
        birthday,
        anniversary,
        location,
        avatar: finalAvatar,
      });
      if (success) {
        onBack();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      message.error('保存失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col h-full overflow-hidden"
    >
      <div className="px-3 pt-3 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">个人信息</h2>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-1.5 rounded-full text-sm font-bold bg-cyan-500 text-white shadow-md shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
          保存
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center justify-center py-6">
          <div
            className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shadow-cyan-200/50 dark:shadow-cyan-900/50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={avatarPreview || avatar}
              alt="avatar"
              className="w-full h-full rounded-full bg-white dark:bg-slate-800 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">点击修改头像</p>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-xl text-pink-500">
                <Smile className="w-5 h-5" />
              </div>
              <span className="font-medium">性别</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                男
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                女
              </button>
              <button
                type="button"
                onClick={() => setGender('other')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${gender === 'other' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                保密
              </button>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500">
                <User className="w-5 h-5" />
              </div>
              <span className="font-medium">昵称</span>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="text-right bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-white font-medium w-32"
            />
          </div>

          <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl text-violet-500">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-medium">称号</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="展示在个人主页"
              className="text-right bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-white font-medium w-40 placeholder:text-slate-400"
            />
          </div>

          <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
                <Phone className="w-5 h-5" />
              </div>
              <span className="font-medium">手机号</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-right bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-white font-medium w-32"
            />
          </div>

          <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
                <Mail className="w-5 h-5" />
              </div>
              <span className="font-medium">邮箱</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-right bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-white font-medium w-40"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl text-cyan-500">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-medium">位置</span>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="你在哪里？"
              className="text-right bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-white font-medium w-40"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <button
            type="button"
            className="w-full p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left"
            onClick={openBirthdayPicker}
          >
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-medium">生日</span>
            </div>
            <span className="text-slate-800 dark:text-white font-medium">{birthday || '未设置'}</span>
          </button>

          <button
            type="button"
            className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left"
            onClick={openAnniversaryPicker}
          >
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-medium">恋爱纪念日</span>
            </div>
            <span className="text-slate-800 dark:text-white font-medium">{anniversary || '未设置'}</span>
          </button>
        </div>

        <div className="h-8"></div>
      </div>
    </motion.div>
  );
}
