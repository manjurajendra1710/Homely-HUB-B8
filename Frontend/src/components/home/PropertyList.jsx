import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import "../../css/Home.css";
import { useDispatch, useSelector } from "react-redux";
import { propertyAction } from "../../store/Property/property-slice";
import { getAllProperties } from "../../store/Property/property-action";

const Card = ({ id, image, name, address, price }) => {
  const imageUrl = image
    ? image.replace("https://images.unsplash.com", "/unsplash")
    : "";

  return (
    <figure className="property">
      <Link to={`/propertylist/${id}`}>
        <img
          src={imageUrl}
          alt="Propertyimg"
        />
      </Link>

      <h4>{name}</h4>

      <figcaption>
        <main className="propertydetails">
          <h5>{name}</h5>

          <h6>
            <span className="material-symbols-outlined houseicon">
              home_pin
            </span>
            {address}
          </h6>

          <p>
            <span className="price">₹{price}</span> per night
          </p>
        </main>
      </figcaption>
    </figure>
  );
};

const PropertyList = () => {
  const [currentPage, setCurrentPage] = useState({
    page: 1
  });

  const dispatch = useDispatch();

  const {
    properties = [],
    totalProperties = 0,
    loading,
    error
  } = useSelector((state) => state.properties);

  const lastPage = Math.ceil(totalProperties / 12);

  const propertyListRef = useRef(null);

  useEffect(() => {
    const fetchProperties = async () => {
      dispatch(
        propertyAction.updateSearchParams(currentPage)
      );

      dispatch(getAllProperties());
    };

    fetchProperties();
  }, [currentPage, dispatch]);

  useEffect(() => {
    if (propertyListRef.current) {
      gsap.fromTo(
        propertyListRef.current.children,
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [properties]);

  if (loading) {
    return <p>Loading properties...</p>;
  }

  if (error) {
    return <p className="not_found">{error}</p>;
  }

  return (
    <>
      {properties.length === 0 ? (
        <p className="not_found">
          Property not found
        </p>
      ) : (
        <div
          className="propertylist"
          ref={propertyListRef}
        >
          {properties.map((property) => (
            <Card
              key={property._id}
              id={property._id}
              image={property.images?.[0]?.url}
              name={property.propertyName}
              address={`${property.address?.city || ""}, ${
                property.address?.state || ""
              } ${property.address?.pincode || ""}`}
              price={property.price}
            />
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          className="previous_btn"
          onClick={() =>
            setCurrentPage((prev) => ({
              page: prev.page - 1
            }))
          }
          disabled={currentPage.page === 1}
        >
          <span className="material-symbols-outlined">
            arrow_back_ios_new
          </span>
        </button>

        <button
          className="next_btn"
          onClick={() =>
            setCurrentPage((prev) => ({
              page: prev.page + 1
            }))
          }
          disabled={
            properties.length < 12 ||
            currentPage.page === lastPage
          }
        >
          <span className="material-symbols-outlined">
            arrow_forward_ios
          </span>
        </button>
      </div>
    </>
  );
};

export default PropertyList;