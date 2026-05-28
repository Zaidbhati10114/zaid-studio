import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BookingBar from "@/app/components/BookingBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="relative overflow-x-hidden">{children}</main>
      <Footer />
      <BookingBar />
    </>
  );
}
