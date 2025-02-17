const supabase = require("../config/supabase");

exports.getConsumptions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user data from the "user" table
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (userError) {
      console.error("User Error:", userError);
      return res.status(500).json({ error: "Failed to fetch user data." });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    const currentUserId = userData.user_id;

    // Fetch project IDs for the user from the "org_user" table
    const { data: orgUserData, error: orgUserError } = await supabase
      .from("org_user")
      .select("proj_id")
      .eq("user_id", currentUserId);

    if (orgUserError) {
      console.error("org_user Error:", orgUserError);
      return res
        .status(500)
        .json({ error: "Failed to fetch organization or project data." });
    }

    if (!orgUserData || orgUserData.length === 0) {
      return res
        .status(404)
        .json({ error: "No projects associated with this user." });
    }

    const userProjIds = orgUserData.map((proj) => proj.proj_id);

    if (userProjIds.length === 0) {
      return res
        .status(404)
        .json({ error: "No projects associated with this user." });
    }

    // Fetch address from the "project" table using the project IDs
    const { data: projectsData, error: projectsError } = await supabase
      .from("project")
      .select("proj_id, address")
      .in("proj_id", userProjIds);

    if (projectsError) {
      console.error("Projects Error:", projectsError);
      return res.status(500).json({ error: "Failed to fetch project data." });
    }

    const projectAddressMap = {};
    projectsData.forEach((project) => {
      projectAddressMap[project.proj_id] = project.address;
    });

    // 4. Fetch energy consumption data for the user's project IDs
    const { data: energyConsumptionData, error: energyConsumptionError } =
      await supabase
        .from("energy_consumption")
        .select("*")
        .in("proj_id", userProjIds);

    if (energyConsumptionError) {
      console.error("Supabase Query Error:", energyConsumptionError);
      return res
        .status(500)
        .json({ error: "Failed to fetch energy consumption data." });
    }

    const currentMonth = new Date().getMonth(); // Get the current month (0-based index)

    const processedData = energyConsumptionData.map((item) => {
      // Fetch current month consumption and temperature
      const currentMonthConsumption =
        item.monthly_energy_consumption[currentMonth];
      const currentMonthTemperature = item.monthly_temperature[currentMonth];

      // Determine the previous month (wrap around to December if currentMonth is January)
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousMonthConsumption =
        item.monthly_energy_consumption[previousMonth];

      // Calculate the percentage variation compared to the previous month
      let variation = null;
      if (previousMonthConsumption !== 0) {
        variation =
          ((currentMonthConsumption - previousMonthConsumption) /
            previousMonthConsumption) *
          100;
        variation = parseFloat(variation.toFixed(2)); // Ensure variation is a float with 2 decimals
      }

      // Attach the address using the map
      const projectAddress = projectAddressMap[item.proj_id] || null;

      return {
        ...item,
        projectAddress,
        currentMonthConsumption,
        currentMonthTemperature,
        variation,
      };
    });

    return res.status(200).json({ energyConsumptionData: processedData });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};

exports.getConsumption = async (req, res) => {
  try {
    const { hubId } = req.params;

    const { data: hubData, error: hubError } = await supabase
      .from("hub")
      .select("proj_id")
      .eq("hub_id", hubId)
      .single();

    if (hubError || !hubData) {
      console.error("Hub Error:", hubError);
      return res
        .status(500)
        .json({ error: "Failed to fetch project id from hub." });
    }

    const projId = hubData.proj_id;

    const { data: projectData, error: projectAddressError } = await supabase
      .from("project")
      .select("address")
      .eq("proj_id", projId)
      .single();

    if (projectAddressError || !projectData) {
      console.error("Project Address Error:", projectAddressError);
      return res
        .status(500)
        .json({ error: "Failed to fetch project address." });
    }

    const { data: energyConsumptionData, error: energyConsumptionError } =
      await supabase.from("energy_consumption").select("*").eq("hub_id", hubId);

    if (energyConsumptionError) {
      console.error("Supabase Query Error:", energyConsumptionError);
      return res
        .status(500)
        .json({ error: "Failed to fetch energy consumption data." });
    }

    const currentMonth = new Date().getMonth();

    const processedData = energyConsumptionData.map((item) => {
      const currentMonthConsumption =
        item.monthly_energy_consumption[currentMonth];
      const currentMonthTemperature = item.monthly_temperature[currentMonth];

      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousMonthConsumption =
        item.monthly_energy_consumption[previousMonth];

      let variation = null;
      if (previousMonthConsumption !== 0) {
        variation =
          ((currentMonthConsumption - previousMonthConsumption) /
            previousMonthConsumption) *
          100;
        variation = parseFloat(variation.toFixed(2));
      }

      return {
        ...item,
        projectAddress: projectData.address,
        currentMonthConsumption,
        currentMonthTemperature,
        variation,
      };
    });

    return res.status(200).json({ energyConsumptionData: processedData });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};
