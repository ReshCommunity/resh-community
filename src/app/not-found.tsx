import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="axil-not-found-area axil-section-gap bg-color-white">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="not-found-content text-center">
              <div className="image mb--30">
                <Image
                  src="/images/others/404.png"
                  alt="404 Not Found"
                  width={500}
                  height={300}
                  className="mb--30"
                />
              </div>
              <h1 className="title mb--10">404</h1>
              <h2 className="subtitle mb--20">Page Not Found</h2>
              <p className="description mb--30">
                The page you are looking for doesn&apos;t exist or has been moved.
                Please check the URL or go back to the homepage.
              </p>
              <div className="axil-button-group">
                <Link href="/" className="axil-button btn-fill-primary btn-large">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
