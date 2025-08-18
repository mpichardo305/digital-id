import Link from "next/link";
import Image from "next/image";

type Props = {
  logoSrc?: string;
  logoAlt?: string;
  brand?: string;
  year?: number;
};

export default function SiteFooter({
  logoSrc = "/digital-id-logo.png",
  logoAlt = "Digital ID",
  brand = "Digital ID",
  year = new Date().getFullYear(),
}: Props) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="flex flex-col items-start">
            <Link href="/">
              <Image src={logoSrc} alt={logoAlt} width={48} height={48} priority />
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs md:text-sm text-gray-500">
            © {year} {brand}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}