import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import SplashScreen from '@/components/store/SplashScreen';
import SettingsFetcher from '@/components/store/SettingsFetcher';
import AuthListener from '@/components/store/AuthListener';

export default function StoreLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SettingsFetcher />
      <AuthListener />
      <SplashScreen />
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
