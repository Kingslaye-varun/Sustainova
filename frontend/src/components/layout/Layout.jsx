import { Header, BottomNav } from './Navigation';

const Layout = ({ children, aqi }) => {
    return (
        <div className="min-h-screen bg-[#0A1628] text-white">
            <Header aqiValue={aqi} />
            <main className="pt-[60px] pb-[70px] max-w-[500px] mx-auto px-4">
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
