import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { X, Mail, Phone, Building, LogOut, UserPlus } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useLocation } from "wouter";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSidebar({
  isOpen,
  onClose,
}: ProfileSidebarProps) {
  const [, navigate] = useLocation();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mobileNotifications, setMobileNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  const [transformClass, setTransformClass] = useState("-translate-x-full");

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the animation works
      setTimeout(() => {
        setTransformClass("translate-x-0");
      }, 10);
    } else {
      setTransformClass("-translate-x-full");
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop, not the panel itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
      onClick={handleBackdropClick}
    >
      <div
        className={`absolute inset-y-0 left-0 max-w-sm w-full bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 ${transformClass}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Profil &amp; Ayarlar</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            {/* User Profile */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-medium">
                  AS
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Ahmet Şahin</h4>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Yönetici
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Mail className="text-neutral-500 dark:text-neutral-400 mr-3 h-5 w-5" />
                  <p>ahmet@firma.com</p>
                </div>
                <div className="flex items-center">
                  <Phone className="text-neutral-500 dark:text-neutral-400 mr-3 h-5 w-5" />
                  <p>+90 555 123 4567</p>
                </div>
                <div className="flex items-center">
                  <Building className="text-neutral-500 dark:text-neutral-400 mr-3 h-5 w-5" />
                  <p>Firma Ltd. Şti.</p>
                </div>
              </div>

              <Button className="w-full mt-6" variant="outline">
                Profili Düzenle
              </Button>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">Bildirim Tercihleri</h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">E-posta Bildirimleri</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Günlük özet e-postaları
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mobil Bildirimler</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Anlık durum güncellemeleri
                      </p>
                    </div>
                    <Switch
                      checked={mobileNotifications}
                      onCheckedChange={setMobileNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Haftalık Raporlar</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pazartesi günleri gönderilir
                      </p>
                    </div>
                    <Switch
                      checked={weeklyReports}
                      onCheckedChange={setWeeklyReports}
                    />
                  </div>
                </div>
              </Card>

              {/* Appearance */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">Görünüm</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Karanlık Mod</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Koyu tema kullan
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </Card>

              {/* Security */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">Güvenlik</h4>

                <div className="space-y-3">
                  <Button className="w-full justify-between" variant="outline">
                    <span>Şifre Değiştir</span>
                    <span className="ml-2">→</span>
                  </Button>

                  <Button className="w-full justify-between" variant="outline">
                    <span>İki Faktörlü Doğrulama</span>
                    <span className="ml-2">→</span>
                  </Button>
                </div>
              </Card>

              {/* User Management */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">Kullanıcı Yönetimi</h4>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      navigate("/users/new");
                      onClose(); // Close sidebar after navigation
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Yeni Kullanıcı Ekle</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
            <Button
              className="w-full flex items-center justify-center"
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
