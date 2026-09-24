import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";

function App() {
  const [sfData, setSfData] = useState(null);
  const [cashEntryName, setCashEntryName] = useState(null);
  
  // State initialized to null so there is no default selection
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    setCashEntryName(null);
  }, [sfData?.gwPayload?.partyId]);

  useEffect(() => {
      const handleMessage = (event) => {
        if (!event.origin.includes("sandbox.vf.force.com")) return;
  
        console.log("Data received:", event.data);
  
        const data = event.data;

        if (data === null) {
          setSfData(null);
          setCashEntryName(null);
          return;
        }
  
        if (
          typeof data !== "object" ||
          data === null ||
          typeof data.gwMessageType === "undefined"
        ) {
          console.warn("Invalid message received:", data);
          return;
        }
  
        console.log("Message Type:", data.gwMessageType);
        console.log("Message ID:", data.gwMessageId);
        console.log("Payload:", data.gwPayload);

        const entryName = data.gwPayload?.cashEntryName;

        if (entryName) {
          setCashEntryName(entryName);
          return;
        }

        setSfData(data);
      };
  
      window.addEventListener("message", handleMessage);
  
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, []);

  // Handler for the horizontal options
  const handleOptionChange = (event, newOption) => {
    if (newOption !== null) {
      setSelectedOption(newOption);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            IAG POC - Salesforce Integration with I frame
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4,  pb: 4 }}>

        <Paper
          elevation={4}
          sx={{
            padding: 3,
            borderRadius: 3,
            mb: 4,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h6" gutterBottom align="center">
            {sfData ? "Customer Found - Proceed to Payment" : "Search for a Customer"}
          </Typography>

          {/* Grid Container for Vertical Stack */}
          <Grid container spacing={3}>
            
            {/* Top Section: Search Iframe */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                Search Customer
              </Typography>
              <Box
                sx={{
                  border: "2px solid #1976d2",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <iframe
                  src="https://racv--iagiqa--c.sandbox.vf.force.com/apex/ExternalCustomerManagerVF"
                  width="100%"
                  height="500px"
                  style={{ border: "none" }}
                  title="Search Iframe"
                />
              </Box>
            </Grid>

            {sfData && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  Payment Setup for {sfData.Name}
                </Typography>
                {sfData.gwPayload?.partyId == null ? (
                  <Alert severity="error">
                    Unable to load payment setup: Guidewire Id is missing for this customer.
                  </Alert>
                ) : (
                  <Box
                    sx={{
                      border: "2px solid #2e7d32",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src={`https://racv--iagiqa--c.sandbox.vf.force.com/apex/ExternalCustomerPaymentVF?id=${sfData.gwPayload.partyId}`}
                      width="100%"
                      height="550px"
                      style={{ border: "none" }}
                      title="Payment Iframe"
                    />
                  </Box>
                )}

                {cashEntryName && (
                  <Card elevation={3} sx={{ borderRadius: 3, mt: 2 }}>
                    <CardContent>
                      <Typography>
                        Cash entry created: <strong>{cashEntryName}</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Data Display Section */}
        <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Received From Salesforce
            </Typography>

            {sfData ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Message Type:</strong> {sfData.gwMessageType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Message Id:</strong> {sfData.gwMessageId}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>PartyId:</strong> {sfData.gwPayload?.partyId}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No data received yet...
              </Typography>
            )}
          </CardContent>
        </Card>

      </Container>
      
    </Box>
  );
}

export default App;