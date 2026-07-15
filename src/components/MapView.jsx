import { Fragment, useState } from 'react';
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';

export default function MapView({ places, center }) {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const getSummary = (place) => {
    const text =
      place.overview?.replace(/<[^>]+>/g, '').trim() || '설명 없음';

    return text.length > 170 ? `${text.slice(0, 170)}…` : text;
  };

  return (
    <Map
      center={center}
      style={{ width: '100%', height: '100vh' }}
      level={5}
    >
      {places.map((place) => {
        const lat = Number(place.mapy);
        const lng = Number(place.mapx);
        const placeKey = place.contentid || place.id;

        return (
          <Fragment key={placeKey}>
            <MapMarker
              position={{ lat, lng }}
              onClick={() => setSelectedPlace(place)}
              image={{
                src: '/images/pin.png',
                size: { width: 32, height: 40 },
              }}
            />

            {selectedPlace?.contentid === place.contentid ||
            selectedPlace?.id === place.id ? (
              <CustomOverlayMap
                position={{ lat, lng }}
                yAnchor={1.2}
              >
                <div className="map-info-bubble-wrapper">
                  <div className="map-info-bubble">
                    <button
                      className="map-info-bubble__close"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlace(null);
                      }}
                    >
                      ×
                    </button>

                    <img
                      className="map-info-bubble__thumb"
                      src={place.firstimage || '/images/no-image.png'}
                      alt={place.title}
                      onError={(e) => {
                        e.currentTarget.src = '/images/no-image.png';
                      }}
                    />

                    <div className="map-info-bubble__body">
                      <h4 className="map-info-bubble__title">
                        {place.title || '장소명 없음'}
                      </h4>

                      <p className="map-info-bubble__address">
                        {place.addr1 || place.address || '주소 정보 없음'}
                      </p>

                      <p className="map-info-bubble__desc">
                        {getSummary(place)}
                      </p>
                    </div>
                  </div>
                </div>
              </CustomOverlayMap>
            ) : null}
          </Fragment>
        );
      })}
    </Map>
  );
}