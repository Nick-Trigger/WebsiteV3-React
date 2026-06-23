export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer footer-center block mb-5 pt-10">
      <div className="pb-2">&copy; {year} Nicholas Trigger</div>
    </footer>
  );
}
