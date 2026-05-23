import React from "react";
import "src/pages/homepage/Homepage.css";
import Button from "@mui/material/Button";
import { Box, Divider, List, ListItem, ListItemText, Popover, Stack, Typography } from "@mui/material";
import { useCustomTheme } from "src/themes/Theme";
import { IoBookmarksOutline, IoLocateOutline, IoSearch } from "react-icons/io5";
import { TbSoccerField } from "react-icons/tb";
import { BsPerson } from "react-icons/bs";
import { FaLongArrowAltRight } from "react-icons/fa";
import { GoComment } from "react-icons/go";
import { PiCityLight } from "react-icons/pi";
import BlackBg5 from "src/assets/images/black-bg-5.svg";
import { Facility } from "@/interfaces/Facility";
import { City } from "@/interfaces/CityDistrict";
import { District } from "@/interfaces/CityDistrict";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";

const Homepage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]); 4
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [listType, setListType] = useState<"cities" | "districts" | "facilities" | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useCustomTheme();
  const [selectedCity, setSelectedCity] = React.useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>("");
  const [selectedFacility, setSelectedFacility] = React.useState<string>("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          apiUrl + "/api/v1/cities",
          {

          }
        );
        setCities(response.data);
        console.log(response.data);
      } catch (err) {

      }
    };
    fetchFacilities();
    fetchCities();
    console.log(cities);
  }, []);

  const fetchFacilities = async () => {
    const response = await axios.get(apiUrl + "/api/v1/facilities");

    if (response.status === 200) {
      const facilities = response.data;
      setFacilities(facilities);
    }
  }

  const filterFacilities = () => {
    const filteredFacilities = facilities
      .filter(
        (facility) =>
          (!selectedCity || facility.city === selectedCity) &&
          (!selectedDistrict || facility.district === selectedDistrict)
      )

    setFilteredFacilities(filteredFacilities);
  }

  useEffect(() => {
    filterFacilities();
  }, [facilities]);

  const handleSelect = (item: string | City | District | Facility) => {
    if (listType === "cities" && typeof item !== "string") {
      const city = item as City;  // Cast item to City type
      setSelectedCity(city.name);
      setDistricts(city.districts || []);
      setSelectedDistrict("");
    } else if (listType === "districts" && typeof item !== "string") {
      const district = item as District;  // Cast item to District type
      setSelectedDistrict(district.name);
    } else if (listType === "facilities" && typeof item !== "string") {
      const facility = item as Facility;
      setSelectedFacility(facility.name);
      navigate(`/halisaha/${facility.id}`);

    }
    handleClose();  // Close the popover after selection
  };
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    type: "cities" | "districts" | "facilities"
  ) => {
    setAnchorEl(event.currentTarget);
    setListType(type);
  };
  fetchFacilities();
  const handleClose = () => {
    setAnchorEl(null);
    setListType(null);
  };
  return (
    <Box className="homepage" bgcolor={theme.palette.background.primary.w250}>
      <div className="welcome-container">
        <div>
          <div className="homepage-welcome-content">
            <div className="homepage-welcome-title-container">
              <h1 className="homepage-welcome-header">Şimdi Oyna!</h1>
              <h2 className="homepage-welcome-inner">
                Favori Sahanı Seç, Hemen Randevunu Al
              </h2>
            </div>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: 2,
                overflow: "hidden",
                width: "40rem",
                marginTop: "2.5rem",

                height: "3.5rem",
              }}
            >
              <Button
                onClick={(e) => handleClick(e, "cities")}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0.75rem",
                  borderRight: "1px solid #ccc",
                  borderRadius: 0,
                  color: "#333",
                  textTransform: "none",
                  height: "100%",
                  minHeight: "3.5rem",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <Typography variant="body1" sx={{ color: "#888" }}>
                  {selectedCity ? selectedCity : "İl Seçiniz"}
                </Typography>
                <SearchIcon sx={{ color: "#1976d2" }} />
              </Button>

              <Button
                onClick={(e) => handleClick(e, "districts")}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 0,
                  color: "#333",
                  textTransform: "none",
                  height: "100%",
                  minHeight: "3rem",
                  borderRight: "1px solid #ccc", // ÇİZGİ EKLENDİ
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <Typography variant="body1" sx={{ color: "#888" }}>
                  {selectedDistrict ? selectedDistrict : "İlçe Seçiniz"}
                </Typography>
                <SearchIcon sx={{ color: "#1976d2" }} />
              </Button>


              <Button
                onClick={(e) => handleClick(e, "facilities")}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 0,
                  color: "#333",
                  textTransform: "none",
                  height: "100%",
                  minHeight: "3rem",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <Typography variant="body1" sx={{ color: "#888" }}>
                  {selectedFacility ? selectedFacility : "Tesis Seçiniz"}
                </Typography>
                <SearchIcon sx={{ color: "#1976d2" }} />
              </Button>
            </Box>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <List
                sx={{
                  width: "14rem",
                  maxHeight: "15rem",
                  overflowY: "auto",
                }}
              >
                {
                  (listType === "cities" ? cities : listType === "facilities" ? filteredFacilities : districts).map((item, index) => (
                    <ListItem
                      component="li"
                      key={index}
                      onClick={() => handleSelect(item)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#d3e3fd",
                        },
                        backgroundColor: "rgba(0, 0, 0, 50, 0.5)",
                      }}
                    >
                      <ListItemText
                        primary={typeof item === "string" ? item : item.name}  // Access name if item is a City or District object
                        sx={{ color: "#333" }}
                      />
                    </ListItem>
                  ))}
              </List>
            </Popover>
            <h2 className="homepage-welcome-inner-down">
              Sahancepte'ye Hoş Geldin <br />Saha Kiralamak Şimdi Çok Kolay
            </h2>
          </div>
        </div>
      </div>

      <Stack
        width="full"
        bgcolor={theme.palette.background.primary.w253}
        direction="column"
        sx={{ padding: { md: "4rem" } }}
      >
        <Box
          className="homepage-howto-header-container"
          width="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            align="center"
            fontFamily="Barlow Condensed"
            color={theme.palette.tx.primary.w300}
            fontWeight={600}
            sx={{ width: { md: "42%" }, fontSize: { md: "2.8rem" } }}
            className="homepage-howto-header-text"
          >
            Sahancepte'ye Hoş Geldin <br /> Saha Kiralamak Şimdi Çok Kolay
          </Typography>
        </Box>
        <Box
          sx={{ marginTop: { md: "2rem" } }}
          width="100%"
          className="homepage-howto-content-container"
        >
          <Stack
            gap={6}
            justifyContent="center"
            alignItems="flex-start"
            direction="row"
            className="homepage-howto-content"
          >
            <div className="homepage-howto-content-box">
              <IoLocateOutline
                color={theme.palette.primary.dark}
                className="homepage-howto-content-box-icon"
              />
              <div
                style={{ color: theme.palette.tx.primary.w300 }}
                className="homepage-howto-content-box-title"
              >
                Bul
              </div>
              <div className="homepage-howto-content-box-title-below">Bul</div>
              <div
                style={{ color: theme.palette.tx.primary.w200 }}
                className="homepage-howto-content-box-desc"
              >
                Çevrendeki halı sahaları bul
              </div>
            </div>
            <Box
              sx={{ marginTop: { md: "2rem" } }}
              className="homepage-howto-content-box"
            >
              <IoSearch
                color={theme.palette.primary.dark}
                className="homepage-howto-content-box-icon"
              />
              <div
                style={{ color: theme.palette.tx.primary.w300 }}
                className="homepage-howto-content-box-title"
              >
                Keşfet
              </div>
              <div className="homepage-howto-content-box-title-below">
                Keşfet
              </div>
              <div
                style={{ color: theme.palette.tx.primary.w200 }}
                className="homepage-howto-content-box-desc"
              >
                Sana yakın halı sahaları karşılaştır, sana en uygun olanı seç!
              </div>
            </Box>
            <div className="homepage-howto-content-box">
              <TbSoccerField
                color={theme.palette.primary.dark}
                className="homepage-howto-content-box-icon"
              />
              <div
                style={{ color: theme.palette.tx.primary.w300 }}
                className="homepage-howto-content-box-title"
              >
                Oyna
              </div>
              <div className="homepage-howto-content-box-title-below">Oyna</div>
              <div
                style={{ color: theme.palette.tx.primary.w200 }}
                className="homepage-howto-content-box-desc"
              >
                Sahanı belirle, rezervasyonunu yap
              </div>
            </div>
          </Stack>
        </Box>
      </Stack>

      <Stack
        sx={{ height: { md: "40rem" } }}
        zIndex="0"
        direction="row"
        justifyContent="center"
        className="homepage-our-services"
      >
        <Box
          component="img"
          sx={{
            backgroundImage: "url('" + BlackBg5 + "')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            height: "40rem",
            width: "110%",
            position: "absolute",
            zIndex: "-10",
          }}
        />
        <Box
          bgcolor="rgba(40,40,40,0)"
          width="44%"
          display="flex"
          alignItems="flex-start"
          justifyContent="center"
        >
          <Stack
            /* sx={{ marginTop: { md: "3rem" } }} */
            direction="column"
            width="90%"
            height="100%"
            justifyContent="center"
          >
            <Typography
              textAlign="left"
              sx={{
                fontSize: { sm: "3rem", xlg: "3.4rem", xxl: "4rem" },
                marginTop: { md: "2rem" },
              }}
              fontWeight={400}
              fontFamily="Barlow"
              style={{ color: theme.palette.tx.secondary.w200 }}
            >
              Hizmetlerimiz
            </Typography>
            <Typography
              sx={{
                fontSize: { md: "1.3rem", xlg: "1.5rem" },
                marginTop: { md: "2rem" },
              }}
              fontWeight={200}
              fontFamily="Poppins"
              style={{ color: theme.palette.tx.secondary.w100 }}
              textAlign="left"
            >
              Eşsiz ve kullanıcı dostu özelliklerimizle futbol deneyiminizi bir
              üst seviyeye taşıyoruz. İster hızlı bir rezervasyon yapmak, ister
              takımınızı oluşturmak, isterse de çekilişlerle harika ödüller
              kazanmak isteyin, ihtiyaçlarınıza hitap eden çözümler sunuyoruz!
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{ marginTop: { md: "3rem" } }}
            >
              <Button
                style={{
                  fontFamily: "Quicksand",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  backgroundColor: "rgb(24 197 69)",
                }}
                variant="contained"
              >
                <FaLongArrowAltRight
                  style={{ marginRight: "0.7rem", marginTop: 3 }}
                  size="1rem"
                />
                Rezervasyon Yap
              </Button>
            </Box>
          </Stack>
        </Box>

        <Box
          bgcolor="transparent"
          width="44%"
          className="homepage-our-services-section"
        >
          <Stack
            sx={{ width: { md: "96%", xxl: "90%" } }}
            direction="row"
            flexWrap="wrap"
          >
            <Stack
              sx={{
                padding: {
                  sm: "1rem",
                  xlg: "1.4rem",
                  xxl: "2rem",
                },
                margin: { sm: "0.5rem", xlg: "1rem", xxl: "2rem" },
                width: { sm: "100%", xlg: "44%", xxl: "40%" },
              }}
              className="homepage-our-services-section-card"
            >
              <div className="homepage-our-services-section-card-header">
                <div
                  style={{ color: "rgb(72 243 72)" }}
                  className="material-symbols-outlined"
                >
                  Sweep
                </div>
                <div
                  style={{ color: theme.palette.tx.secondary.w400 }}
                  className="homepage-our-services-section-title"
                >
                  Hızlı Ve Kolay Randevu
                </div>
              </div>
              <div
                style={{ color: theme.palette.tx.secondary.w100 }}
                className="homepage-our-services-section-card-text"
              >
                İstediğiniz şehirdeki halı sahaları kolayca bulup anında
                rezervasyon yapın.{" "}
                {/* Tarih ve saat seçiminizi yaparak, en uygun
                sahayı birkaç tıkla seçebilirsiniz. */}
              </div>
            </Stack>

            <Stack
              sx={{
                padding: {
                  sm: "1rem",
                  xlg: "1.4rem",
                  xxl: "2rem",
                },
                margin: { sm: "0.5rem", xlg: "1rem", xxl: "2rem" },
                width: { sm: "100%", xlg: "44%", xxl: "40%" },
              }}
              className="homepage-our-services-section-card"
            >
              <div className="homepage-our-services-section-card-header">
                <div
                  style={{ color: "rgb(72 243 72)" }}
                  className="material-symbols-outlined"
                >
                  Sports_Soccer{" "}
                </div>
                <div
                  style={{ color: theme.palette.tx.secondary.w400 }}
                  className="homepage-our-services-section-title"
                >
                  Kadro Oluşturma
                </div>
              </div>
              <div
                style={{ color: theme.palette.tx.secondary.w100 }}
                className="homepage-our-services-section-card-text"
              >
                Kullanıcılar, sanal oyun tahtası üzerinde takımlarını kurabilir
                ve dizilişlerini belirleyebilir.
                {/*  Maç öncesi stratejinizi kolayca
                planlayın. */}
              </div>
            </Stack>

            <Stack
              sx={{
                padding: {
                  sm: "1rem",
                  xlg: "1.4rem",
                  xxl: "2rem",
                },
                margin: { sm: "0.5rem", xlg: "1rem", xxl: "2rem" },
                width: { sm: "100%", xlg: "44%", xxl: "40%" },
              }}
              className="homepage-our-services-section-card"
            >
              <div className="homepage-our-services-section-card-header">
                <div
                  style={{ color: "rgb(72 243 72)" }}
                  className="material-symbols-outlined"
                >
                  Sweep
                </div>
                <div
                  style={{ color: theme.palette.tx.secondary.w400 }}
                  className="homepage-our-services-section-title"
                >
                  Hızlı Ve Kolay Randevu
                </div>
              </div>

              <div
                style={{ color: theme.palette.tx.secondary.w100 }}
                className="homepage-our-services-section-card-text"
              >
                Kullanıcılar, deneyimlerini paylaşarak diğerlerine yardımcı
                olur.{" "}
                {/* Sahalar hakkında yapılan yorumları okuyarak en iyi
                seçimleri yapabilirsiniz. */}
              </div>
            </Stack>

            <Stack
              sx={{
                padding: {
                  sm: "1rem",
                  xlg: "1.4rem",
                  xxl: "2rem",
                },
                margin: { sm: "0.5rem", xlg: "1rem", xxl: "2rem" },
                width: { sm: "100%", xlg: "44%", xxl: "40%" },
              }}
              className="homepage-our-services-section-card"
            >
              <div className="homepage-our-services-section-card-header">
                <div
                  style={{ color: "rgb(72 243 72)" }}
                  className="material-symbols-outlined"
                >
                  Redeem
                </div>
                <div
                  style={{ color: theme.palette.tx.secondary.w400 }}
                  className="homepage-our-services-section-title"
                >
                  Çekilişler ve Hediyeler
                </div>
              </div>
              <div
                style={{ color: theme.palette.tx.secondary.w100 }}
                className="homepage-our-services-section-card-text"
              >
                Kullanıcılarımıza düzenlediğimiz çekilişlerle harika hediyeler
                kazanma şansı sunuyoruz.{/*  Katılın, şansınızı deneyin! */}
              </div>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Stack
        direction="column"
        width="100%"
        alignItems="center"
        /* bgcolor={theme.palette.background.primary.w253} */
        sx={{ marginTop: { md: "5rem" } }}
      >
        <Typography
          sx={{ width: { sm: "70%", md: "60%", xxl: "40%" } }}
          textAlign="center"
          fontFamily="Barlow Condensed"
          fontSize="2.4rem"
          color={theme.palette.tx.primary.w600}
          fontWeight={300}
        >
          Halı sahadan randevu almak şimdi çok daha kolay, sizin için farklı
          şehirlerdeki halısahaları bir araya getirdik
        </Typography>
        <Stack
          marginTop="5rem"
          gap={1}
          sx={{ width: { sm: "90%", md: "80%", xxl: "60%" } }}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack
            bgcolor={theme.palette.background.primary.w253}
            sx={{
              paddingX: { sm: "2rem", md: "3rem", xxl: "4rem" },
              paddingY: { sm: "0.6rem", xxl: "1rem" },
            }}
            className="homepage-statistics-box"
          >
            <Box
              color={theme.palette.primary.light}
              className="homepage-statistics-box-header"
            >
              <BsPerson className="homepage-statistics-box-header-logo" />
              <Box className="homepage-statistics-box-header-title">Üye</Box>
            </Box>
            <Box
              color={theme.palette.tx.primary.w600}
              className="homepage-statistics-box-content"
            >
              14
            </Box>
          </Stack>
          <Stack
            sx={{
              paddingX: { sm: "2rem", md: "3rem", xxl: "4rem" },
              paddingY: { sm: "0.6rem", xxl: "1rem" },
            }}
            bgcolor={theme.palette.background.primary.w253}
            className="homepage-statistics-box"
          >
            <Box
              color={theme.palette.primary.light}
              className="homepage-statistics-box-header"
            >
              <IoBookmarksOutline className="homepage-statistics-box-header-logo" />
              <Box className="homepage-statistics-box-header-title">
                Rezervasyon
              </Box>
            </Box>
            <Box
              color={theme.palette.tx.primary.w600}
              className="homepage-statistics-box-content"
            >
              96
            </Box>
          </Stack>
          <Stack
            sx={{
              paddingX: { sm: "2rem", md: "3rem", xxl: "4rem" },
              paddingY: { sm: "0.6rem", xxl: "1rem" },
            }}
            bgcolor={theme.palette.background.primary.w253}
            className="homepage-statistics-box"
          >
            <Box
              color={theme.palette.primary.light}
              className="homepage-statistics-box-header"
            >
              <GoComment className="homepage-statistics-box-header-logo" />
              <Box className="homepage-statistics-box-header-title">Yorum</Box>
            </Box>
            <Box
              color={theme.palette.tx.primary.w600}
              className="homepage-statistics-box-content"
            >
              52
            </Box>
          </Stack>
          <Stack
            sx={{
              paddingX: { sm: "2rem", md: "3rem", xxl: "4rem" },
              paddingY: { sm: "0.6rem", xxl: "1rem" },
            }}
            bgcolor={theme.palette.background.primary.w253}
            className="homepage-statistics-box"
          >
            <Box
              color={theme.palette.primary.light}
              className="homepage-statistics-box-header"
            >
              <PiCityLight className="homepage-statistics-box-header-logo" />
              <Box className="homepage-statistics-box-header-title">Şehir</Box>
            </Box>
            <Box
              color={theme.palette.tx.primary.w600}
              className="homepage-statistics-box-content"
            >
              8
            </Box>
          </Stack>
        </Stack>
      </Stack>

      <Stack
        zIndex="0"
        sx={{ marginTop: { md: "10rem", marginBottom: "10rem" } }}
        direction="row"
        width="100%"
        alignItems="center"
        justifyContent="center"
      /* height="40rem" */
      >
        {/* <Box
          component="img"
          sx={{
            backgroundImage: "url('" + BlackBg14 + "')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            height: "40rem",
            width: "110%",
            position: "absolute",
            zIndex: "-1",
          }}
        /> */}
        <Stack width="30%" height="100%" alignItems="center">
          <Stack
            width="100%"
            height="100%"
            zIndex={1}
            direction="column"
            justifyContent="flex-start"
          >
            <Typography
              fontFamily="Quicksand"
              fontWeight={400}
              color={theme.palette.tx.primary.w500}
              sx={{ fontSize: "3rem" }}
            >
              Bize Katılın
            </Typography>

            <Typography
              fontFamily="Quicksand"
              fontWeight={500}
              color={theme.palette.tx.primary.w500}
              sx={{ marginTop: "1rem", fontSize: "1.2rem" }}
            >
              Sisteme katılarak halı sahanızı binlerce kullanıcıya tanıtma
              fırsatı yakalayın. Kullanıcılar, şehirlerindeki halı sahaları
              hızlıca bulabilir, rezervasyon yapabilir ve saha deneyimlerini
              paylaşabilir. Halı sahanızın bilinirliğini artırın,
              rezervasyonlarınızı kolaylaştırın!
            </Typography>
            <Button
              style={{
                fontFamily: "Quicksand",
                fontSize: "1.2rem",
                fontWeight: 700,
                backgroundColor: "rgb(24 197 69)",
                width: "fit-content",
              }}
              variant="contained"
              sx={{ marginTop: "2rem" }}
            >
              İletişime Geçin
            </Button>
          </Stack>
        </Stack>
        <Stack
          width="40%"
          height="100%"
          alignItems="flex-end"
          flexDirection="column"
          justifyContent="flex-start"
        >
          <Stack
            width="80%"
            justifyContent="flex-start"
            flexDirection="column"
            zIndex={1}
          >
            <Typography
              fontFamily="Quicksand"
              fontWeight={800}
              /* borderBottom="1px solid" */
              color={theme.palette.tx.primary.w500}
              /* color={theme.palette.primary.light} */
              sx={{ fontSize: "1.4rem" }}
            >
              SIK SORULAN SORULAR
            </Typography>
            <Divider
              sx={{
                borderColor: theme.palette.primary.main,
                opacity: 0.5,
                marginTop: "0.5rem",
              }}
            />
            <Box className="homepage-contactus-fqa-box">
              <Typography
                color={theme.palette.tx.primary.w600}
                sx={{ fontSize: "1rem" }}
                className="homepage-contactus-fqa-question-title"
              >
                Birden fazla halı saha rezervasyonu yapabilir miyim?
              </Typography>
              <Typography
                sx={{ fontSize: "0.9rem" }}
                color={theme.palette.tx.primary.w100}
                className="homepage-contactus-fqa-question-desc"
              >
                Sahan Cepte, aynı anda birden fazla sahada rezervasyon yapmanıza olanak tanır.
                İster arkadaş grubunuzla farklı saatlerde oynayın, ister turnuvalar için birden fazla saha ayırtın,
                tümünü kolayca yönetebilirsiniz.
              </Typography>
            </Box>
            <Box className="homepage-contactus-fqa-box">
              <Typography
                color={theme.palette.tx.primary.w600}
                sx={{ fontSize: "1rem" }}
                className="homepage-contactus-fqa-question-title"
              >
                Rezervasyonu nasıl iptal edebilirim?
              </Typography>
              <Typography
                sx={{ fontSize: "0.9rem" }}
                color={theme.palette.tx.primary.w100}
                className="homepage-contactus-fqa-question-desc"
              >
                Hesabım-Rezervasyonlarım bölümünden aktif rezervasyonlarınızı iptal edebilirsiniz.
              </Typography>
            </Box>
            <Box className="homepage-contactus-fqa-box">
              <Typography
                color={theme.palette.tx.primary.w600}
                sx={{ fontSize: "1rem" }}
                className="homepage-contactus-fqa-question-title"
              >
                Rezervasyon saatinden önce halı saha değiştirebilir miyim?
              </Typography>
              <Typography
                sx={{ fontSize: "0.9rem" }}
                color={theme.palette.tx.primary.w100}
                className="homepage-contactus-fqa-question-desc"
              >
                Evet, değiştirebilirsiniz, ancak bu durum tesisin izin vermesine bağlıdır.
                Rezervasyon yaptığınız tesisin değişiklik politikalarını kontrol edebilir veya tesis yetkilileriyle iletişime geçerek talebinizi iletebilirsiniz.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
export default Homepage;
