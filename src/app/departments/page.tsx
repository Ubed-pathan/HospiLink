import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';
import DepartmentsView from '@/components/departments/DepartmentsView';

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavHeader />
      <DepartmentsView />
      <Footer />
    </div>
  );
}
