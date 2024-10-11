const supabase = require('../connection/supabase');

exports.test1 = async () => {
  const { data, error } = await supabase
    .from('user')
    .select('*');

  if (error) throw error;
  return data;
};

exports.test2 = async () => {
  const { data, error } = await supabase
    .from('organization')
    .select('*');

  if (error) throw error;
  return data;
};