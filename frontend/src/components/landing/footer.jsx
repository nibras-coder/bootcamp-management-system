function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 py-8 text-center">
      <p className="text-sm">
        © {new Date().getFullYear()} ASTU MSJ Bootcamp. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;