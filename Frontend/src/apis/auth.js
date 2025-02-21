const API_BASE_URL = "http://localhost:3000"; 

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log("data",data)
    return data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { error: "Something went wrong" };
  }
};

export const resetPassword = async (token, password, passwordConfirmation) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reset_password_token: token,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Something went wrong" };
  }
};
