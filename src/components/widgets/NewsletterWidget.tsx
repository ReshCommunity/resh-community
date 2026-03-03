export function NewsletterWidget() {
  return (
    <div className="axil-single-widget mt--30 mt_sm--30 mt_md--30">
      <h5 className="widget-title">Newsletter</h5>
      <div className="axil-subscribe-area">
        <p className="mb--20">
          Subscribe to our newsletter for the latest crypto news and insights.
        </p>
        <form className="axil-subscribe-form">
          <div className="d-flex">
            <input
              type="email"
              placeholder="Your email"
              className="form-control"
              required
            />
            <button
              type="submit"
              className="btn-fill-primary hover-flip-item-wrapper"
            >
              <span className="hover-flip-item">
                <span data-text="Subscribe">Subscribe</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
