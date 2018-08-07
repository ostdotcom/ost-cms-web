class GetEntitiesMeta

  def initialize

  end

  def get_config
    @get_config ||= GlobalConstant::EntitiesMeta.get()
  end

  def get_meta_config
    get_config[:meta]
  end
end