const AAdsBanner = () => {
  return (
    <div style={{ position: 'absolute', zIndex: 99999 }}>
      <input autoComplete="off" type="checkbox" id="aadsstickymjle7aza" hidden />
      <div style={{ paddingTop: 'auto', paddingBottom: 0 }}>
        <div style={{
          width: '100%',
          height: 'auto',
          position: 'fixed',
          textAlign: 'center',
          fontSize: 0,
          top: 0,
          left: 0,
          right: 0,
          margin: 'auto'
        }}>
          <label
            htmlFor="aadsstickymjle7aza"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              right: '24px',
              position: 'absolute',
              borderRadius: '4px',
              background: 'rgba(248, 248, 249, 0.70)',
              padding: '4px',
              zIndex: 99999,
              cursor: 'pointer'
            }}
          >
            <svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
              <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337" />
            </svg>
          </label>
          <div id="frame" style={{ width: '100%', margin: 'auto', position: 'relative', zIndex: 99998 }}>
            <iframe
              data-aa="2421987"
              src="//acceptable.a-ads.com/2421987/?size=Adaptive"
              style={{ border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', margin: 'auto' }}
            />
            <div style={{ width: '70%', margin: 'auto', textAlign: 'left', position: 'absolute', left: 0, right: 0 }}>
              <a
                style={{
                  display: 'inline-block',
                  fontSize: '13px',
                  color: '#263238',
                  padding: '4px 10px',
                  background: '#F8F8F9',
                  textDecoration: 'none',
                  borderRadius: '0 0 4px 4px'
                }}
                id="frame-link"
                target="_blank"
                rel="noopener noreferrer"
                href="https://aads.com/campaigns/new?source_id=2421987&source_type=ad_unit&partner=2421987"
              >
                Advertise here
              </a>
            </div>
          </div>
        </div>
        <style>{`
          #aadsstickymjle7aza:checked + div {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AAdsBanner;
